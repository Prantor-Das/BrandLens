import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnabledModels } from "@/lib/models";
import { prisma } from "@/lib/prisma";
import { estimateProgress } from "@/lib/poll";
import {
  aggregateItemSchema,
  inferSentiment,
  parseInsights,
  type ResultsAggregateItem,
  type ResultsBrandResult
} from "@/lib/results";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  jobId: z.string().min(1)
});

type ResponseRecord = {
  modelId: string;
  modelName: string;
  processingMs: number;
  rawResponse: string;
  brandResults: Array<{
    brandName: string;
    mentionCount: number;
    firstPosition: number | null;
    sentimentScore: number;
    visibilityScore: number;
  }>;
};

function trimText(value: string, maxLength = 500): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;
}

function getErrorMessage(results: unknown): string {
  if (results && typeof results === "object" && "error" in results) {
    const error = (results as { error?: unknown }).error;

    if (typeof error === "string") {
      return error;
    }
  }

  return "Analysis failed";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = routeParamsSchema.parse(await context.params);

  const job = await prisma.analysisJob.findUnique({
    where: {
      id: params.jobId
    },
    include: {
      responses: {
        include: {
          brandResults: true
        },
        orderBy: {
          modelName: "asc"
        }
      }
    }
  });

  if (!job) {
    return NextResponse.json(
      {
        error: "Analysis job not found"
      },
      {
        status: 404
      }
    );
  }

  const responses = job.responses as ResponseRecord[];

  const enabledModels =
    responses.length > 0
      ? [...new Set(responses.map((response) => response.modelId))]
      : getEnabledModels().map((model) => model.id);

  if (job.status === "PENDING" || job.status === "RUNNING") {
    return NextResponse.json({
      status: job.status,
      percentComplete: estimateProgress(job),
      brand: job.brand,
      competitors: job.competitors,
      enabledModels,
      modelResponses: [],
      brandResults: [],
      aggregate: [],
      insights: [],
      createdAt: job.createdAt.toISOString()
    });
  }

  if (job.status === "ERROR") {
    return NextResponse.json({
      status: "ERROR",
      brand: job.brand,
      competitors: job.competitors,
      enabledModels,
      modelResponses: [],
      brandResults: [],
      aggregate: [],
      insights: [],
      createdAt: job.createdAt.toISOString(),
      error: getErrorMessage(job.results)
    });
  }

  const trimmedModelResponses = responses.map((response) => ({
    modelId: response.modelId,
    modelName: response.modelName,
    durationMs: response.processingMs,
    rawResponse: trimText(response.rawResponse)
  }));

  const brandResults: ResultsBrandResult[] = responses.flatMap((response) => {
    const ranked = [...response.brandResults].sort((left, right) => {
      if (right.visibilityScore !== left.visibilityScore) {
        return right.visibilityScore - left.visibilityScore;
      }

      if (right.mentionCount !== left.mentionCount) {
        return right.mentionCount - left.mentionCount;
      }

      return left.brandName.localeCompare(right.brandName);
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

  let aggregate: ResultsAggregateItem[] = [];

  if (job.results && typeof job.results === "object" && "aggregate" in job.results) {
    const parsedAggregate = aggregateItemSchema.safeParse(
      (job.results as { aggregate?: unknown }).aggregate
    );

    if (parsedAggregate.success) {
      aggregate = parsedAggregate.data.map((item, index) => ({
        brandName: item.brand,
        avgVisibilityScore: item.averageVisibilityScore,
        dominantSentiment: item.dominantSentiment ?? "neutral",
        totalMentions: item.totalMentions ?? 0,
        modelsPresent: item.modelsPresent ?? 0,
        rank: item.rank ?? index + 1,
        delta: item.delta ?? 0
      }));
    }
  }

  return NextResponse.json({
    status: job.status,
    brand: job.brand,
    competitors: job.competitors,
    enabledModels,
    aggregate,
    insights: parseInsights(job.insights),
    modelResponses: trimmedModelResponses,
    brandResults,
    createdAt: job.createdAt.toISOString()
  });
}
