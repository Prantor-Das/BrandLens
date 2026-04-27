import { z } from "zod";

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

export function parseInsights(value: string | null | undefined): ResultsInsight[] {
  if (!value) {
    return [];
  }

  try {
    return insightsSchema.parse(JSON.parse(value));
  } catch {
    return [];
  }
}
