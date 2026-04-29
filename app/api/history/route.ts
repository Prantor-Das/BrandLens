import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const aggregateItemSchema = z.object({
  brand: z.string(),
  averageVisibilityScore: z.number()
});

function getTopBrandSummary(results: unknown): {
  topBrand: string | null;
  topBrandScore: number | null;
} {
  if (!results || typeof results !== "object" || !("aggregate" in results)) {
    return {
      topBrand: null,
      topBrandScore: null
    };
  }

  const parsed = z
    .array(aggregateItemSchema)
    .safeParse((results as { aggregate?: unknown }).aggregate);

  if (!parsed.success || parsed.data.length === 0) {
    return {
      topBrand: null,
      topBrandScore: null
    };
  }

  const [topBrand] = [...parsed.data].sort(
    (left, right) => right.averageVisibilityScore - left.averageVisibilityScore
  );

  return {
    topBrand: topBrand.brand,
    topBrandScore: topBrand.averageVisibilityScore
  };
}

export async function GET() {
  const jobs = await prisma.analysisJob.findMany({
    where: {
      status: "DONE"
    },
    select: {
      id: true,
      brand: true,
      competitors: true,
      createdAt: true,
      status: true,
      results: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 10
  });

  return NextResponse.json({
    items: jobs.map((job) => {
      const { topBrand, topBrandScore } = getTopBrandSummary(job.results);

      return {
        id: job.id,
        brand: job.brand,
        competitors: job.competitors,
        createdAt: job.createdAt,
        status: job.status,
        topBrand,
        topBrandScore
      };
    })
  });
}
