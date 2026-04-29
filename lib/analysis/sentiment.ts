import { z } from "zod";
import { buildSentimentPrompt } from "@/lib/prompts";
import type { SentimentResult } from "@/lib/types";

const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  score: z.number().min(-1).max(1),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1)
});

const fallbackSentiment: SentimentResult = {
  sentiment: "neutral",
  score: 0,
  confidence: 0,
  reason: "Could not analyse"
};

function extractJsonObject(input: string): string {
  const trimmed = input.trim();

  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in LLM response");
  }

  return trimmed.slice(start, end + 1);
}

export async function analyseSentiment(
  brandName: string,
  contexts: string[],
  llmQueryFn: (prompt: string) => Promise<string>
): Promise<SentimentResult> {
  if (contexts.length === 0) {
    return fallbackSentiment;
  }

  try {
    const brandContext = [
      `Brand: ${brandName}`,
      "Contexts:",
      ...(contexts.length > 0 ? contexts : ["No contexts provided."])
    ].join("\n");
    const raw = await llmQueryFn(
      buildSentimentPrompt(brandContext)
    );

    return sentimentSchema.parse(JSON.parse(extractJsonObject(raw)));
  } catch (error) {
    console.warn(
      `[sentiment] Falling back to neutral sentiment for ${brandName}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    return fallbackSentiment;
  }
}
