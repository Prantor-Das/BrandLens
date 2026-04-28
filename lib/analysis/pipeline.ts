import { extractEntities } from "@/lib/analysis/extractor";
import { aggregateAcrossModels } from "@/lib/analysis/aggregator";
import { calculateVisibilityScore, getScoreLabel } from "@/lib/analysis/scorer";
import { analyseSentiment } from "@/lib/analysis/sentiment";
import { saveBrandResults, saveModelResponses, updateJobStatus } from "@/lib/db/writer";
import { ExtractionError, safeRun, wrapWithTimeout } from "@/lib/errors";
import type { OrchestratorResult } from "@/lib/orchestrator";
import type {
  BrandAnalysis,
  EntityResult,
  PerModelResult,
  PipelineResult,
  SentimentResult
} from "@/lib/types";

const LLM_TIMEOUT_MS = 30_000;

export interface PipelineParams {
  jobId: string;
  brand: string;
  competitors: string[];
  responses: OrchestratorResult[];
  llmQueryFn: (prompt: string) => Promise<string>;
}

function buildEmptyBrandResults(brands: string[]): BrandAnalysis[] {
  return brands.map((brand) => ({
    brand,
    mentions: 0,
    firstPosition: 999,
    contexts: [],
    sentiment: {
      sentiment: "neutral",
      score: 0,
      confidence: 0,
      reason: "Pipeline fallback"
    },
    visibilityScore: 0,
    scoreLabel: "absent"
  }));
}

async function runExtraction(
  rawResponse: string,
  brands: string[],
  llmQueryFn: (prompt: string) => Promise<string>,
  label: string
): Promise<EntityResult[]> {
  const results = await safeRun(
    () =>
      extractEntities(rawResponse, brands, (prompt) =>
        wrapWithTimeout(llmQueryFn(prompt), LLM_TIMEOUT_MS, `${label} extraction`)
      ),
    brands.map((brand) => ({
      brand,
      mentions: 0,
      firstPosition: 999,
      contexts: []
    })),
    `${label} extraction`
  );

  if (!Array.isArray(results)) {
    throw new ExtractionError(`${label} extraction returned an invalid payload`);
  }

  return results;
}

async function runSentiment(
  brandName: string,
  contexts: string[],
  llmQueryFn: (prompt: string) => Promise<string>,
  label: string
): Promise<SentimentResult> {
  return safeRun(
    () =>
      analyseSentiment(brandName, contexts, (prompt) =>
        wrapWithTimeout(
          llmQueryFn(prompt),
          LLM_TIMEOUT_MS,
          `${label} sentiment:${brandName}`
        )
      ),
    {
      sentiment: "neutral",
      score: 0,
      confidence: 0,
      reason: "Pipeline fallback"
    },
    `${label} sentiment:${brandName}`
  );
}

async function analyzeModelResponse(params: {
  persistedResponse: {
    id: string;
    modelId: string;
    modelName: string;
    rawResponse: string;
  };
  brands: string[];
  totalModels: number;
  llmQueryFn: (prompt: string) => Promise<string>;
}): Promise<PerModelResult> {
  const label = `${params.persistedResponse.modelName} (${params.persistedResponse.modelId})`;
  const rawResponse = params.persistedResponse.rawResponse;

  if (!rawResponse.trim()) {
    const emptyResults = buildEmptyBrandResults(params.brands);
    await saveBrandResults(params.persistedResponse.id, emptyResults);

    return {
      responseId: params.persistedResponse.id,
      modelId: params.persistedResponse.modelId,
      modelName: params.persistedResponse.modelName,
      brands: emptyResults
    };
  }

  const entities = await runExtraction(
    rawResponse,
    params.brands,
    params.llmQueryFn,
    label
  );

  const brandResults = await Promise.all(
    entities.map(async (entity): Promise<BrandAnalysis> => {
      const sentiment = await runSentiment(
        entity.brand,
        entity.contexts,
        params.llmQueryFn,
        label
      );
      const visibilityScore = calculateVisibilityScore({
        mentions: entity.mentions,
        firstPosition: entity.firstPosition,
        totalModels: params.totalModels,
        modelsPresent: entity.mentions > 0 ? 1 : 0,
        sentimentScore: sentiment.score
      });

      return {
        brand: entity.brand,
        mentions: entity.mentions,
        firstPosition: entity.firstPosition,
        contexts: entity.contexts,
        sentiment,
        visibilityScore,
        scoreLabel: getScoreLabel(visibilityScore)
      };
    })
  );

  await saveBrandResults(params.persistedResponse.id, brandResults);

  return {
    responseId: params.persistedResponse.id,
    modelId: params.persistedResponse.modelId,
    modelName: params.persistedResponse.modelName,
    brands: brandResults
  };
}

export async function runAnalysisPipeline(
  params: PipelineParams
): Promise<PipelineResult> {
  const brands = [...new Set([params.brand, ...params.competitors])];
  const totalModels = Math.max(params.responses.length, 1);
  const allModelsFailed = params.responses.every(
    (response) => !response.response?.trim()
  );

  await updateJobStatus(params.jobId, "RUNNING");

  try {
    if (allModelsFailed) {
      throw new Error("All AI models timed out. Please try again.");
    }

    const persistedResponses = await saveModelResponses(params.jobId, params.responses);
    const byModel = await Promise.all(
      persistedResponses.map((persistedResponse) =>
        analyzeModelResponse({
          persistedResponse,
          brands,
          totalModels,
          llmQueryFn: params.llmQueryFn
        })
      )
    );
    const aggregate = aggregateAcrossModels(byModel, totalModels);
    const winner = aggregate[0]?.brand ?? params.brand;
    const results = {
      byModel,
      aggregate,
      winner
    };

    await updateJobStatus(params.jobId, "DONE", {
      results
    });

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pipeline error";

    await updateJobStatus(params.jobId, "ERROR", {
      error: message
    });

    throw error;
  }
}
