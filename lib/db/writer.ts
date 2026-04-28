import {
  AnalysisJobStatus,
  Prisma,
  type ModelResponse
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { OrchestratorResult } from "@/lib/orchestrator";
import type { AnalysisStatus, BrandAnalysis } from "@/lib/types";
import { DatabaseError } from "@/lib/errors";

function mapStatus(status: AnalysisStatus): AnalysisJobStatus {
  switch (status) {
    case "PENDING":
      return AnalysisJobStatus.PENDING;
    case "RUNNING":
      return AnalysisJobStatus.RUNNING;
    case "DONE":
      return AnalysisJobStatus.DONE;
    case "ERROR":
      return AnalysisJobStatus.ERROR;
    default:
      return AnalysisJobStatus.PENDING;
  }
}

export async function saveModelResponses(
  jobId: string,
  responses: OrchestratorResult[]
): Promise<ModelResponse[]> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.modelResponse.findMany({
        where: {
          jobId,
          modelId: {
            in: responses.map((response) => response.modelId)
          }
        }
      });

      const existingByModelId = new Map(
        existing.map((response) => [response.modelId, response] as const)
      );

      const persisted = await Promise.all(
        responses.map((response) => {
          const data = {
            jobId,
            modelId: response.modelId,
            modelName: response.modelName,
            rawResponse: response.response ?? "",
            processingMs: response.durationMs
          };
          const record = existingByModelId.get(response.modelId);

          if (record) {
            return tx.modelResponse.update({
              where: {
                id: record.id
              },
              data
            });
          }

          return tx.modelResponse.create({
            data
          });
        })
      );

      return persisted;
    });
  } catch (error) {
    throw new DatabaseError("Failed to save model responses", { cause: error });
  }
}

export async function saveBrandResults(
  responseId: string,
  results: BrandAnalysis[]
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.brandResult.deleteMany({
        where: {
          responseId
        }
      });

      if (results.length === 0) {
        return;
      }

      await tx.brandResult.createMany({
        data: results.map((result) => ({
          responseId,
          brandName: result.brand,
          mentionCount: result.mentions,
          firstPosition: result.firstPosition >= 999 ? null : result.firstPosition,
          sentimentScore: result.sentiment.score,
          visibilityScore: result.visibilityScore
        }))
      });
    });
  } catch (error) {
    throw new DatabaseError(
      `Failed to save brand results for response ${responseId}`,
      { cause: error }
    );
  }
}

export async function updateJobStatus(
  jobId: string,
  status: AnalysisStatus,
  extras?: {
    results?: object;
    insights?: string;
    error?: string;
  }
): Promise<void> {
  try {
    const resultsPayload =
      extras?.results !== undefined
        ? extras.results
        : extras?.error !== undefined
          ? { error: extras.error }
          : undefined;

    await prisma.analysisJob.update({
      where: {
        id: jobId
      },
      data: {
        status: mapStatus(status),
        ...(resultsPayload !== undefined
          ? { results: resultsPayload as Prisma.InputJsonValue }
          : {}),
        ...(extras?.insights !== undefined ? { insights: extras.insights } : {})
      }
    });
  } catch (error) {
    const message =
      extras?.error ??
      (error instanceof Error ? error.message : "Unknown database error");

    throw new DatabaseError(`Failed to update job ${jobId}: ${message}`, {
      cause: error
    });
  }
}
