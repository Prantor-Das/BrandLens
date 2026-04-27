import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { getEnabledModels } from "@/lib/models";
import { runOrchestrator } from "@/lib/orchestrator";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { generateInsights } from "@/lib/insights";

export const runtime = "nodejs";

const analyzeRequestSchema = z.object({
  brand: z.string().trim().min(1).max(100),
  competitors: z.array(z.string().trim().min(1).max(100)).max(5),
  prompt: z.string().trim().max(280).optional()
});

function getCheapestModelQuery() {
  const enabledModels = getEnabledModels();
  const preferredOrder = ["claude", "gemini", "openai"];

  const cheapestModel =
    preferredOrder
      .map((id) => enabledModels.find((model) => model.id === id))
      .find(Boolean) ?? enabledModels[0];

  if (!cheapestModel) {
    throw new Error("No enabled models configured");
  }

  return {
    enabledModels,
    analysisQuery: cheapestModel.query
  };
}

async function processAnalysisJob(jobId: string): Promise<void> {
  const job = await prisma.analysisJob.findUnique({
    where: {
      id: jobId
    }
  });

  if (!job) {
    throw new Error(`Analysis job ${jobId} not found`);
  }

  await prisma.analysisJob.update({
    where: {
      id: jobId
    },
    data: {
      status: "RUNNING"
    }
  });

  try {
    const { enabledModels, analysisQuery } = getCheapestModelQuery();
    const orchestratorResults = await runOrchestrator(job.prompt, enabledModels);

    const persistedResponses = await Promise.all(
      orchestratorResults.map((result) =>
        prisma.modelResponse.create({
          data: {
            jobId,
            modelId: result.modelId,
            modelName: result.modelName,
            rawResponse: result.response ?? `[ERROR] ${result.error ?? "Unknown model failure"}`,
            processingMs: result.durationMs
          }
        })
      )
    );

    const pipelineResult = await runAnalysisPipeline({
      jobId,
      brand: job.brand,
      competitors: job.competitors,
      modelResponses: persistedResponses,
      llmQueryFn: analysisQuery
    });

    const insights = await generateInsights({
      brand: job.brand,
      aggregate: pipelineResult.aggregate,
      winner: pipelineResult.winner,
      enabledModels: enabledModels.map((model) => model.id)
    });

    await prisma.analysisJob.update({
      where: {
        id: jobId
      },
      data: {
        status: "DONE",
        insights,
        results: {
          ...pipelineResult,
          insights
        }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analysis error";

    await prisma.analysisJob.update({
      where: {
        id: jobId
      },
      data: {
        status: "ERROR",
        results: {
          error: message
        }
      }
    });
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const input = analyzeRequestSchema.parse(rawBody);
    const prompt = buildAnalysisPrompt(
      input.brand,
      input.competitors,
      input.prompt
    );

    const job = await prisma.analysisJob.create({
      data: {
        brand: input.brand,
        competitors: input.competitors,
        prompt,
        status: "PENDING"
      }
    });

    void processAnalysisJob(job.id);

    return NextResponse.json(
      {
        jobId: job.id
      },
      {
        status: 202
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: error.flatten()
        },
        {
          status: 400
        }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Request body must be valid JSON"
        },
        {
          status: 400
        }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not create analysis job"
      },
      {
        status: 500
      }
    );
  }
}
