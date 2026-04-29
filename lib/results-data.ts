import type { Metadata } from "next";
import { demoResultsPayload } from "@/lib/demo-data";
import { getJobById } from "@/lib/services/history";
import {
  parseInsights,
  inferSentiment,
  type ResultsApiPayload,
  type ResultSentiment,
  type ResultsAggregateItem
} from "@/lib/results";

export async function getResultsPayload(jobId: string): Promise<ResultsApiPayload | null> {
  if (jobId === "demo") {
    return demoResultsPayload;
  }

  const job = await getJobById(jobId);

  if (!job) {
    return null;
  }

  const enabledModels =
    job.responses.length > 0
      ? [...new Set(job.responses.map((response) => response.modelId))]
      : job.selectedModels;

  if (job.status === "PENDING" || job.status === "RUNNING") {
    return {
      status: job.status,
      percentComplete: 5,
      brand: job.brand,
      competitors: job.competitors,
      enabledModels,
      modelResponses: [],
      brandResults: [],
      aggregate: [],
      insights: [],
      createdAt: job.createdAt.toISOString()
    };
  }

  if (job.status === "ERROR") {
    const fallbackError =
      job.results && typeof job.results === "object" && "error" in job.results
        ? String((job.results as { error?: unknown }).error ?? "Analysis failed")
        : "Analysis failed";

    return {
      status: "ERROR",
      brand: job.brand,
      competitors: job.competitors,
      enabledModels,
      modelResponses: [],
      brandResults: [],
      aggregate: [],
      insights: [],
      createdAt: job.createdAt.toISOString(),
      error: fallbackError
    };
  }

  const modelResponses = job.responses.map((response) => ({
    modelId: response.modelId,
    modelName: response.modelName,
    rawResponse: response.rawResponse,
    durationMs: response.processingMs
  }));

  const brandResults = job.responses.flatMap((response) => {
    const ranked = [...response.brandResults].sort((left, right) => {
      if (right.visibilityScore !== left.visibilityScore) {
        return right.visibilityScore - left.visibilityScore;
      }

      return right.mentionCount - left.mentionCount;
    });
    const leaderScore = ranked[0]?.visibilityScore ?? 0;

    return ranked.map((brandResult, index) => ({
      brandName: brandResult.brandName,
      mentionCount: brandResult.mentionCount,
      firstPosition: brandResult.firstPosition,
      sentimentScore: brandResult.sentimentScore,
      visibilityScore: brandResult.visibilityScore,
      sentiment: inferSentiment(brandResult.sentimentScore),
      modelName: response.modelName,
      rank: index + 1,
      delta: Math.round((leaderScore - brandResult.visibilityScore) * 100) / 100
    }));
  });

  const aggregate: ResultsAggregateItem[] =
    job.results && typeof job.results === "object" && "aggregate" in job.results
      ? (((job.results as { aggregate?: Array<Record<string, unknown>> }).aggregate ?? []).map(
          (item, index) => {
            const dominantSentiment: ResultSentiment =
              item.dominantSentiment === "positive" ||
              item.dominantSentiment === "negative" ||
              item.dominantSentiment === "neutral"
                ? item.dominantSentiment
                : "neutral";

            return {
              brandName: String(item.brand ?? ""),
              avgVisibilityScore: Number(item.averageVisibilityScore ?? 0),
              dominantSentiment,
              totalMentions: Number(item.totalMentions ?? 0),
              modelsPresent: Number(item.modelsPresent ?? 0),
              rank: Number(item.rank ?? index + 1),
              delta: Number(item.delta ?? 0)
            };
          }
        ))
      : [];

  return {
    status: "DONE",
    brand: job.brand,
    competitors: job.competitors,
    enabledModels,
    aggregate,
    insights: parseInsights(job.insights),
    modelResponses,
    brandResults,
    createdAt: job.createdAt.toISOString()
  };
}

export function buildResultsMetadata(payload: ResultsApiPayload, jobId: string): Metadata {
  const brandTitle = [payload.brand, ...payload.competitors.slice(0, 1)].join(" vs ");
  const title = `${brandTitle} - BrandLens AI Report`;
  const description = `See how ${payload.brand} performed against ${payload.competitors.join(", ")} across AI assistants.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/results/${jobId}/opengraph-image`]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/results/${jobId}/opengraph-image`]
    }
  };
}
