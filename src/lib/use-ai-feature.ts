import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useAiFeature<TResult>(feature: string) {
  const [result, setResult] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (payload: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature, ...payload }),
        });
        const json = (await response.json()) as {
          text?: string;
          data?: TResult;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(json.error ?? "The request failed. Please try again.");
        }
        const value = (json.data ?? json.text) as TResult;
        setResult(value);
        toast.success("Ready", { description: "Your AI output has been generated." });
        return value;
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Something went wrong. Please try again.";
        setError(message);
        toast.error("Generation failed", { description: message });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [feature],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, run, reset };
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Could not copy", { description: "Your browser blocked clipboard access." });
  }
}