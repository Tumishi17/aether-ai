const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";

export function getRunId(request: Request) {
  return request.headers.get(RUN_ID_HEADER)?.trim() || undefined;
}

export function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  let resolveRunId: (value: string | undefined) => void = () => {};
  let resolved = false;
  const ready = new Promise<string | undefined>((resolve) => {
    resolveRunId = resolve;
  });

  const publish = (value?: string) => {
    const next = value?.trim() || undefined;
    if (!runId && next) runId = next;
    if (!resolved) {
      resolved = true;
      resolveRunId(runId);
    }
  };
  if (runId) publish(runId);

  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
      try {
        const response = await fetch(input, { ...init, headers });
        publish(response.headers.get(RUN_ID_HEADER) ?? undefined);
        return response;
      } catch (error) {
        publish(undefined);
        throw error;
      }
    },
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : ready),
  };
}

export class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type JsonSchema = Record<string, unknown>;

/**
 * Calls the Lovable AI Gateway Responses API with streaming enabled (required for
 * reasoning models) and returns the accumulated final text.
 */
export async function runResponses(options: {
  system: string;
  prompt: string;
  schema?: { name: string; schema: JsonSchema };
  initialRunId?: string;
}) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new GatewayError(500, "AI is not configured for this workspace.");

  const body: Record<string, unknown> = {
    model: "openai/gpt-5.6-sol",
    stream: true,
    instructions: options.system,
    input: [{ role: "user", content: [{ type: "input_text", text: options.prompt }] }],
    reasoning: { effort: "low", summary: "auto" },
  };

  if (options.schema) {
    body["text"] = {
      format: {
        type: "json_schema",
        name: options.schema.name,
        strict: true,
        schema: options.schema.schema,
      },
    };
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
      ...(options.initialRunId ? { [RUN_ID_HEADER]: options.initialRunId } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    if (response.status === 429) {
      throw new GatewayError(429, "AI rate limit reached. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new GatewayError(402, "AI credits exhausted for this workspace.");
    }
    throw new GatewayError(response.status, detail || "The AI service returned an error.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && event.response?.output_text) {
          if (!text) text = event.response.output_text;
        }
      } catch {
        // ignore keep-alive / non-JSON frames
      }
    }
  }

  return text.trim();
}

export async function runJson<T>(options: {
  system: string;
  prompt: string;
  schema: { name: string; schema: JsonSchema };
  initialRunId?: string;
}): Promise<T> {
  const text = await runResponses(options);
  if (!text) throw new GatewayError(502, "The AI returned an empty response. Please retry.");
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as T;
    }
    throw new GatewayError(502, "The AI response could not be read. Please retry.");
  }
}