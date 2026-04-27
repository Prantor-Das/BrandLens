import { prisma } from "@/lib/prisma";
import { extractEntities } from "@/lib/analysis/extractor";
import { analyseSentiment } from "@/lib/analysis/sentiment";
import {
  calculateVisibilityScore,
  getScoreLabel
} from "@/lib/analysis/scorer";
import type {
  AggregateBrandScore,
  EntityResult,
  PerModelResult,
  PersistedModelResponse,
  PipelineResult,
  SentimentResult
} from "@/lib/types";

export interface PipelineParams {
  jobId: string;
  brand: string;
  competitors: string[];
  modelResponses: PersistedModelResponse[];
  llmQueryFn: (prompt: string) => Promise<string>;
}

function getDominantSentiment(sentiments: SentimentResult[]): SentimentResult["sentiment"] {
  if (sentiments.length === 0) {
    return "neutral";
  }

  const average =
    sentiments.reduce((sum, item) => sum + item.score, 0) / sentiments.length;

  if (average > 0.2) {
    return "positive";
  }

  if (average < -0.2) {
    return "negative";
  }

  return "neutral";
}

function aggregateBrandData(
  perModelResults: PerModelResult[],
  brands: string[]
): AggregateBrandScore[] {
  return brands.map((brand) => {
    const brandResults = perModelResults
      .map((model) => model.brands.find((item) => item.brand === brand))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const totalMentions = brandResults.reduce((sum, item) => sum + item.mentions, 0);
    const modelsPresent = brandResults.filter((item) => item.mentions > 0).length;
    const averageVisibilityScore =
      brandResults.reduce((sum, item) => sum + item.visibilityScore, 0) /
      Math.max(brandResults.length, 1);
    const averageSentimentScore =
      brandResults.reduce((sum, item) => sum + item.sentiment.score, 0) /
      Math.max(brandResults.length, 1);

    return {
      brand,
      averageVisibilityScore: Math.round(averageVisibilityScore * 100) / 100,
      dominantSentiment: getDominantSentiment(
        brandResults.map((item) => item.sentiment)
      ),
      totalMentions,
      modelsPresent,
      averageSentimentScore: Math.round(averageSentimentScore * 100) / 100
    };
  });
}

async function persistBrandResults(
  modelResponseId: string,
  entities: EntityResult[],
  sentiments: Map<string, SentimentResult>,
  visibilityScores: Map<string, number>
): Promise<void> {
  await prisma.brandResult.deleteMany({
    where: {
      responseId: modelResponseId
    }
  });

  await prisma.brandResult.createMany({
    data: entities.map((entity) => ({
      responseId: modelResponseId,
      brandName: entity.brand,
      mentionCount: entity.mentions,
      firstPosition: entity.firstPosition >= 999 ? null : entity.firstPosition,
      sentimentScore: sentiments.get(entity.brand)?.score ?? 0,
      visibilityScore: visibilityScores.get(entity.brand) ?? 0
    }))
  });
}

export async function runAnalysisPipeline(
  params: PipelineParams
): Promise<PipelineResult> {
  const brands = [...new Set([params.brand, ...params.competitors])];
  const totalModels = Math.max(params.modelResponses.length, 1);

  const byModel = await Promise.all(
    params.modelResponses.map(async (modelResponse): Promise<PerModelResult> => {
      const entities = await extractEntities(
        modelResponse.rawResponse,
        brands,
        params.llmQueryFn
      );

      const sentiments = new Map<string, SentimentResult>();
      const visibilityScores = new Map<string, number>();

      const brandResults = await Promise.all(
        entities.map(async (entity) => {
          const sentiment = await analyseSentiment(
            entity.brand,
            entity.contexts,
            params.llmQueryFn
          );

          const visibilityScore = calculateVisibilityScore({
            mentions: entity.mentions,
            firstPosition: entity.firstPosition,
            totalModels,
            modelsPresent: entity.mentions > 0 ? 1 : 0,
            sentimentScore: sentiment.score
          });

          sentiments.set(entity.brand, sentiment);
          visibilityScores.set(entity.brand, visibilityScore);

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

      await persistBrandResults(
        modelResponse.id,
        entities,
        sentiments,
        visibilityScores
      );

      return {
        responseId: modelResponse.id,
        modelId: modelResponse.modelId,
        modelName: modelResponse.modelName,
        brands: brandResults
      };
    })
  );

  const aggregate = aggregateBrandData(byModel, brands).sort(
    (left, right) => right.averageVisibilityScore - left.averageVisibilityScore
  );

  const winner = aggregate[0]?.brand ?? params.brand;

  await prisma.analysisJob.update({
    where: {
      id: params.jobId
    },
    data: {
      results: {
        byModel,
        aggregate,
        winner
      }
    }
  });

  return {
    byModel,
    aggregate,
    winner
  };
}
