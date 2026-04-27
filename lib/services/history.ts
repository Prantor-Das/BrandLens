import { prisma } from "@/lib/prisma";
import type { FullJobResult, HistoryItem } from "@/lib/types";

function parseTopBrand(job: { results: unknown }): {
  topBrandName: string | null;
  topBrandScore: number | null;
} {
  if (!job.results || typeof job.results !== "object") {
    return {
      topBrandName: null,
      topBrandScore: null
    };
  }

  const aggregate = Reflect.get(job.results, "aggregate");

  if (!Array.isArray(aggregate) || aggregate.length === 0) {
    return {
      topBrandName: null,
      topBrandScore: null
    };
  }

  const topBrand = aggregate[0];

  if (!topBrand || typeof topBrand !== "object") {
    return {
      topBrandName: null,
      topBrandScore: null
    };
  }

  return {
    topBrandName:
      typeof Reflect.get(topBrand, "brand") === "string"
        ? (Reflect.get(topBrand, "brand") as string)
        : null,
    topBrandScore:
      typeof Reflect.get(topBrand, "averageVisibilityScore") === "number"
        ? (Reflect.get(topBrand, "averageVisibilityScore") as number)
        : null
  };
}

export async function getRecentJobs(limit = 10): Promise<HistoryItem[]> {
  const jobs = await prisma.analysisJob.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: limit
  });

  return jobs.map((job) => {
    const { topBrandName, topBrandScore } = parseTopBrand(job);

    return {
      id: job.id,
      brand: job.brand,
      competitors: job.competitors,
      createdAt: job.createdAt,
      status: job.status as HistoryItem["status"],
      topBrandName,
      topBrandScore
    };
  });
}

export async function getJobById(id: string): Promise<FullJobResult | null> {
  return prisma.analysisJob.findUnique({
    where: {
      id
    },
    include: {
      responses: {
        include: {
          brandResults: {
            orderBy: [
              {
                visibilityScore: "desc"
              },
              {
                brandName: "asc"
              }
            ]
          }
        },
        orderBy: {
          modelName: "asc"
        }
      }
    }
  });
}
