import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { getEnabledModels } from "@/lib/models";
import { runOrchestrator } from "@/lib/orchestrator";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { generateInsights } from "@/lib/insights";

export const runtime = "nodejs";

const analyzeRequestSchema = z.object({
  brand: z.string().trim().min(1).max(100),
  competitors: z
    .array(z.string().trim().min(1).max(100))
    .min(0)
    .max(5),
  prompt: z.string().trim().max(280).optional(),
  selectedModelIds: z.array(z.string().trim().min(1)).min(1).optional()
});

function getCheapestModelQuery(selectedModels: string[]) {
  const configuredModels = getEnabledModels();
  const selectedModelSet = new Set(selectedModels);
  const enabledModels =
    selectedModels.length > 0
      ? configuredModels.filter((model) => selectedModelSet.has(model.id))
      : configuredModels;
  const preferredOrder = ["deepseek", "gemini", "claude", "gpt"];

  const cheapestModel =
    preferredOrder
      .map((id) => enabledModels.find((model) => model.id.toLowerCase().includes(id)))
      .find(Boolean) ?? enabledModels[0];

  if (!cheapestModel) {
    throw new Error("No enabled models configured. Add an API key for at least one selected model.");
  }

  return {
    enabledModels,
    analysisQuery: cheapestModel.query
  };
}

async function processAnalysisJob(jobId: string): Promise<void> {
  try {
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

    const { enabledModels, analysisQuery } = getCheapestModelQuery(job.selectedModels);
    const orchestratorResults = await runOrchestrator(job.prompt, enabledModels);

    const pipelineResult = await runAnalysisPipeline({
      jobId,
      brand: job.brand,
      competitors: job.competitors,
      responses: orchestratorResults,
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
        } as unknown as Prisma.InputJsonValue
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analysis error";

    try {
      await prisma.analysisJob.update({
        where: {
          id: jobId
        },
        data: {
          status: "ERROR",
          results: {
            error: message
          } as unknown as Prisma.InputJsonValue
        }
      });
    } catch (updateError) {
      console.error(
        `[analyze] Failed to mark job ${jobId} as ERROR`,
        updateError
      );
    }
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
        selectedModels: input.selectedModelIds ?? [],
        status: "PENDING"
      }
    });

    void (async () => {
      await processAnalysisJob(job.id);
    })();

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
        error: "Could not create analysis job",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      {
        status: 503
      }
    );
  }
}
