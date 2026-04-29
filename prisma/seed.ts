import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import {
  AnalysisJobStatus,
  Prisma,
  PrismaClient
} from "../lib/generated/prisma/client";
import { demoJobResult } from "../lib/demo-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required before running the seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString
  })
});

async function main() {
  await prisma.analysisJob.deleteMany({
    where: {
      id: demoJobResult.id
    }
  });

  await prisma.analysisJob.create({
    data: {
      id: demoJobResult.id,
      createdAt: demoJobResult.createdAt,
      brand: demoJobResult.brand,
      competitors: demoJobResult.competitors,
      selectedModels: demoJobResult.responses.map((response) => response.modelId),
      prompt: demoJobResult.prompt,
      status: AnalysisJobStatus.DONE,
      insights: demoJobResult.insights,
      results: demoJobResult.results as Prisma.InputJsonValue,
      responses: {
        create: demoJobResult.responses.map((response) => ({
          id: response.id,
          modelId: response.modelId,
          modelName: response.modelName,
          rawResponse: response.rawResponse,
          processingMs: response.processingMs,
          brandResults: {
            create: response.brandResults.map((brandResult) => ({
              id: brandResult.id,
              brandName: brandResult.brandName,
              mentionCount: brandResult.mentionCount,
              firstPosition: brandResult.firstPosition,
              sentimentScore: brandResult.sentimentScore,
              visibilityScore: brandResult.visibilityScore
            }))
          }
        }))
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
