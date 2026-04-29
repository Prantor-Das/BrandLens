import { z } from "zod";
import { calculateVisibilityScore } from "@/lib/analysis/scorer";

export type ResultStatus = "PENDING" | "RUNNING" | "DONE" | "ERROR";
export type ResultSentiment = "positive" | "neutral" | "negative";
export type InsightPriority = "high" | "medium" | "low";

export interface ResultsModelResponse {
  modelId: string;
  modelName: string;
  rawResponse: string;
  durationMs: number;
}

export interface ResultsBrandResult {
  brandName: string;
  mentionCount: number;
  firstPosition: number | null;
  sentimentScore: number;
  visibilityScore: number;
  sentiment: ResultSentiment;
  modelName: string;
  rank: number;
  delta: number;
}

export interface ResultsAggregateItem {
  brandName: string;
  avgVisibilityScore: number;
  dominantSentiment: ResultSentiment;
  totalMentions: number;
  modelsPresent: number;
  rank: number;
  delta: number;
}

export interface ResultsInsight {
  title: string;
  description: string;
  priority: InsightPriority;
}

export interface ResultsApiPayload {
  status: ResultStatus;
  percentComplete?: number;
  brand: string;
  brandDescription?: string;
  competitors: string[];
  modelResponses: ResultsModelResponse[];
  brandResults: ResultsBrandResult[];
  aggregate: ResultsAggregateItem[];
  insights: ResultsInsight[];
  enabledModels: string[];
  createdAt?: string;
  error?: string;
}

export const aggregateItemSchema = z.array(
  z.object({
    brand: z.string(),
    averageVisibilityScore: z.number(),
    dominantSentiment: z.enum(["positive", "neutral", "negative"]).optional(),
    totalMentions: z.number().optional(),
    modelsPresent: z.number().optional(),
    rank: z.number().optional(),
    delta: z.number().optional()
  })
);

export const insightsSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"])
  })
);

export function getScoreLabel(score: number) {
  if (score >= 80) {
    return "dominant";
  }

  if (score >= 60) {
    return "strong";
  }

  if (score >= 40) {
    return "present";
  }

  if (score >= 20) {
    return "emerging";
  }

  return "low";
}

export function inferSentiment(score: number): ResultSentiment {
  if (score > 0.15) {
    return "positive";
  }

  if (score < -0.15) {
    return "negative";
  }

  return "neutral";
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function rescoreAggregateItems(
  aggregate: ResultsAggregateItem[],
  brandResults: ResultsBrandResult[],
  totalModels: number
): ResultsAggregateItem[] {
  const rescored = aggregate.map((item) => {
    const matches = brandResults.filter(
      (brandResult) => brandResult.brandName === item.brandName
    );
    const totalMentions = matches.reduce(
      (sum, match) => sum + match.mentionCount,
      0
    );
    const modelsPresent = matches.filter((match) => match.mentionCount > 0).length;
    const firstPosition =
      matches
        .map((match) => match.firstPosition)
        .filter((value): value is number => value !== null && value < 999)
        .sort((left, right) => left - right)[0] ?? 999;
    const averageSentimentScore =
      matches.reduce((sum, match) => sum + match.sentimentScore, 0) /
      Math.max(matches.length, 1);
    const avgVisibilityScore = calculateVisibilityScore({
      mentions: totalMentions,
      firstPosition,
      totalModels,
      modelsPresent,
      sentimentScore: averageSentimentScore
    });

    return {
      ...item,
      avgVisibilityScore,
      totalMentions,
      modelsPresent,
      dominantSentiment: inferSentiment(averageSentimentScore)
    };
  });

  rescored.sort((left, right) => {
    if (right.avgVisibilityScore !== left.avgVisibilityScore) {
      return right.avgVisibilityScore - left.avgVisibilityScore;
    }

    if (right.totalMentions !== left.totalMentions) {
      return right.totalMentions - left.totalMentions;
    }

    return left.brandName.localeCompare(right.brandName);
  });

  const topScore = rescored[0]?.avgVisibilityScore ?? 0;

  return rescored.map((item, index) => ({
    ...item,
    rank: index + 1,
    delta: roundToTwoDecimals(topScore - item.avgVisibilityScore)
  }));
}

export function buildFallbackInsights(
  brand: string,
  aggregate: ResultsAggregateItem[] = []
): ResultsInsight[] {
  const brandScore = aggregate.find((item) => item.brandName === brand);
  const leader =
    aggregate.find((item) => item.rank === 1) ?? aggregate[0] ?? brandScore;
  const isLeader = leader?.brandName === brand;
  const competitorName = !isLeader && leader?.brandName ? leader.brandName : "top competitors";

  return [
    {
      title: "Strengthen source authority",
      description: `Publish clear ${brand} pages with product proof, FAQs, reviews, and third-party citations AI systems can reuse.`,
      priority: "high"
    },
    {
      title: isLeader ? "Defend your lead" : "Close the competitor gap",
      description: isLeader
        ? "Keep messaging consistent across owned pages, directories, reviews, and comparison content."
        : `Add comparison content that explains where ${brand} wins against ${competitorName}.`,
      priority: isLeader ? "medium" : "high"
    },
    {
      title: "Improve prompt coverage",
      description:
        "Create content for buyer use cases, alternatives, pricing, integrations, and category-specific questions.",
      priority: "medium"
    }
  ];
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildBrandDescriptionFallback(
  brand: string,
  rawResponses: string[] = []
): string {
  const brandPattern = new RegExp(`\\b${escapeRegExp(brand)}\\b`, "i");
  const sentences = rawResponses
    .flatMap((response) =>
      normalizeWhitespace(response)
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
    )
    .filter((sentence) => {
      const wordCount = sentence.split(/\s+/).length;
      return brandPattern.test(sentence) && wordCount >= 8 && wordCount <= 42;
    });

  const uniqueSentences = [...new Set(sentences)].slice(0, 3);

  if (uniqueSentences.length > 0) {
    return uniqueSentences.join(" ");
  }

  return `${brand} was included in this AI visibility analysis, but the selected model responses did not provide enough factual company context for a reliable description. Add a competitor or a category-focused custom prompt to help the report capture more brand background.`;
}

export function parseInsights(
  value: string | null | undefined,
  fallback: ResultsInsight[] = []
): ResultsInsight[] {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = insightsSchema.parse(JSON.parse(value));
    return parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}
