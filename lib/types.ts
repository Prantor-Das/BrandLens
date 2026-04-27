import type { ModelResponse as PrismaModelResponse } from "@prisma/client";

export type AnalysisStatus = "PENDING" | "RUNNING" | "DONE" | "ERROR";

export interface ModelAdapter {
  id: string;
  name: string;
  query: (prompt: string) => Promise<string>;
}

export interface EntityResult {
  brand: string;
  mentions: number;
  firstPosition: number;
  contexts: string[];
}

export interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  confidence: number;
  reason: string;
}

export interface ScoreParams {
  mentions: number;
  firstPosition: number;
  totalModels: number;
  modelsPresent: number;
  sentimentScore: number;
}

export interface BrandAnalysisResult {
  brand: string;
  mentions: number;
  firstPosition: number;
  contexts: string[];
  sentiment: SentimentResult;
  visibilityScore: number;
  scoreLabel: "dominant" | "strong" | "present" | "weak" | "absent";
}

export interface PerModelResult {
  responseId: string;
  modelId: string;
  modelName: string;
  brands: BrandAnalysisResult[];
}

export interface AggregateBrandScore {
  brand: string;
  averageVisibilityScore: number;
  dominantSentiment: SentimentResult["sentiment"];
  totalMentions: number;
  modelsPresent: number;
  averageSentimentScore: number;
}

export interface PipelineResult {
  byModel: PerModelResult[];
  aggregate: AggregateBrandScore[];
  winner: string;
}

export type PersistedModelResponse = Pick<
  PrismaModelResponse,
  "id" | "jobId" | "modelId" | "modelName" | "rawResponse" | "processingMs"
>;
