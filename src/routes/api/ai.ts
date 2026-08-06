import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { GatewayError, getRunId, runJson, runResponses } from "@/lib/ai/gateway.server";
import {
  emailPrompt,
  emailSystem,
  meetingSchema,
  meetingSystem,
  plannerSchema,
  plannerSystem,
  researchSchema,
  researchSystem,
} from "@/lib/ai/prompts.server";

const bodySchema = z.discriminatedUnion("feature", [
  z.object({
    feature: z.literal("email"),
    purpose: z.string().trim().min(5).max(1200),
    tone: z.string().trim().min(2).max(40),
    audience: z.string().trim().min(2).max(40),
    length: z.string().trim().min(3).max(20),
    keyPoints: z.string().trim().max(1200).optional(),
  }),
  z.object({
    feature: z.literal("meeting"),
    notes: z.string().trim().min(30).max(16000),
  }),
  z.object({
    feature: z.literal("planner"),
    tasks: z.string().trim().min(10).max(8000),
    workingHours: z.string().trim().max(60).optional(),
  }),
  z.object({
    feature: z.literal("research"),
    question: z.string().trim().min(8).max(1200),
    depth: z.string().trim().max(30).optional(),
  }),
]);

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const initialRunId = getRunId(request);
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json(
            { error: "Please check the form — some inputs are missing or too long." },
            { status: 400 },
          );
        }

        try {
          if (parsed.feature === "email") {
            const text = await runResponses({
              system: emailSystem,
              prompt: emailPrompt(parsed),
              initialRunId,
            });
            return Response.json({ text });
          }

          if (parsed.feature === "meeting") {
            const data = await runJson({
              system: meetingSystem,
              prompt: `Meeting notes:\n"""\n${parsed.notes}\n"""`,
              schema: meetingSchema as unknown as { name: string; schema: Record<string, unknown> },
              initialRunId,
            });
            return Response.json({ data });
          }

          if (parsed.feature === "planner") {
            const data = await runJson({
              system: plannerSystem,
              prompt: `Working hours: ${parsed.workingHours?.trim() || "09:00-17:30"}\nTasks (one per line, may include deadline, priority and estimated duration):\n"""\n${parsed.tasks}\n"""`,
              schema: plannerSchema as unknown as { name: string; schema: Record<string, unknown> },
              initialRunId,
            });
            return Response.json({ data });
          }

          const data = await runJson({
            system: researchSystem,
            prompt: `Research question: ${parsed.question}\nDepth: ${parsed.depth?.trim() || "balanced"}`,
            schema: researchSchema as unknown as { name: string; schema: Record<string, unknown> },
            initialRunId,
          });
          return Response.json({ data });
        } catch (error) {
          const status = error instanceof GatewayError ? error.status : 500;
          const message =
            error instanceof GatewayError
              ? error.message
              : "Something went wrong generating this. Please try again.";
          console.error("AI feature failed", error);
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});