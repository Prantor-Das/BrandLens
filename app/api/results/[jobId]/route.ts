import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { estimateProgress } from "@/lib/poll";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const routeParamsSchema = z.object({
  jobId: z.string().min(1)
});

const aggregateSchema = z.array(
  z.object({
    brand: z.string(),
    averageVisibilityScore: z.number()
  })
);

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

  if (job.status === "PENDING" || job.status === "RUNNING") {
    return NextResponse.json({
      status: job.status,
      percentComplete: estimateProgress(job)
    });
  }

  if (job.status === "ERROR") {
    return NextResponse.json({
      status: "ERROR",
      error: getErrorMessage(job.results)
    });
  }

  const trimmedModelResponses = job.responses.map((response) => ({
    id: response.id,
    modelId: response.modelId,
    modelName: response.modelName,
    processingMs: response.processingMs,
    rawResponse: trimText(response.rawResponse)
  }));

  const brandResults = job.responses.flatMap((response) =>
    response.brandResults.map((brandResult) => ({
      responseId: response.id,
      modelId: response.modelId,
      modelName: response.modelName,
      ...brandResult
    }))
  );

  let aggregate: Array<{ brand: string; averageVisibilityScore: number }> = [];

  if (job.results && typeof job.results === "object" && "aggregate" in job.results) {
    const parsedAggregate = aggregateSchema.safeParse(
      (job.results as { aggregate?: unknown }).aggregate
    );

    if (parsedAggregate.success) {
      aggregate = parsedAggregate.data;
    }
  }

  return NextResponse.json({
    id: job.id,
    brand: job.brand,
    competitors: job.competitors,
    status: job.status,
    createdAt: job.createdAt,
    results: job.results,
    aggregate,
    insights: job.insights,
    modelResponses: trimmedModelResponses,
    brandResults
  });
}
