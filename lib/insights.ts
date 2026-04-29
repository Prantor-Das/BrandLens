import { z } from "zod";
import { getEnabledModels } from "@/lib/models";
import type { AggregateBrandScore } from "@/lib/types";
import { buildFallbackInsights } from "@/lib/results";

const insightSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string().max(120),
    priority: z.enum(["high", "medium", "low"])
  })
);

const modelPreference = ["claude", "gemini", "openai"] as const;

function toResultsAggregateItems(aggregate: AggregateBrandScore[]) {
  return aggregate.map((item) => ({
    brandName: item.brand,
    avgVisibilityScore: item.averageVisibilityScore,
    dominantSentiment: item.dominantSentiment,
    totalMentions: item.totalMentions,
    modelsPresent: item.modelsPresent,
    rank: item.rank,
    delta: item.delta
  }));
}

function buildInsightGenerationPrompt(params: {
  brand: string;
  aggregate: AggregateBrandScore[];
  winner: string;
}): string {
  const brandScore =
    params.aggregate.find((item) => item.brand === params.brand)
      ?.averageVisibilityScore ?? 0;
  const winnerScore =
    params.aggregate.find((item) => item.brand === params.winner)
      ?.averageVisibilityScore ?? 0;

  return `You are a brand strategist. Based on this AI visibility data: ${JSON.stringify(
    params.aggregate
  )}. The brand "${params.brand}" scored ${brandScore}/100. Competitor "${params.winner}" leads with ${winnerScore}/100. Give exactly 3 specific, actionable recommendations to improve "${params.brand}" visibility in AI-generated responses. Format as a JSON array of { title: string, description: string (max 120 chars), priority: 'high'|'medium'|'low' }. Return ONLY the JSON array.`;
}

function extractJsonArray(input: string): string {
  const trimmed = input.trim();

  if (trimmed.startsWith("[")) {
    return trimmed;
  }

  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON array found in insight response");
  }

  return trimmed.slice(start, end + 1);
}

function getPreferredInsightModel(enabledModels: string[]) {
  const availableModels = getEnabledModels().filter((model) =>
    enabledModels.includes(model.id)
  );

  return (
    modelPreference
      .map((id) => availableModels.find((model) => model.id === id))
      .find(Boolean) ?? availableModels[0]
  );
}

export async function generateInsights(params: {
  brand: string;
  aggregate: AggregateBrandScore[];
  winner: string;
  enabledModels: string[];
}): Promise<string> {
  const model = getPreferredInsightModel(params.enabledModels);
  const fallbackInsights = buildFallbackInsights(
    params.brand,
    toResultsAggregateItems(params.aggregate)
  );

  if (!model) {
    return JSON.stringify(fallbackInsights, null, 2);
  }

  try {
    const raw = await model.query(
      buildInsightGenerationPrompt({
        brand: params.brand,
        aggregate: params.aggregate,
        winner: params.winner
      })
    );

    const parsed = insightSchema.parse(JSON.parse(extractJsonArray(raw)));
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.warn(
      `[insights] Falling back to generic recommendations: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    return JSON.stringify(fallbackInsights, null, 2);
  }
}
