import type {
  AnalysisJob,
  BrandResult,
  ModelResponse as PrismaModelResponse
} from "@/lib/generated/prisma/client";

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

export type BrandAnalysis = BrandAnalysisResult;

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
  rank: number;
  delta: number;
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

export interface HistoryItem {
  id: string;
  brand: string;
  competitors: string[];
  createdAt: Date;
  status: AnalysisStatus;
  topBrandScore: number | null;
  topBrandName: string | null;
}

export interface FullJobResult extends AnalysisJob {
  responses: Array<
    PrismaModelResponse & {
      brandResults: BrandResult[];
    }
  >;
}
