import { NextResponse } from "next/server";
import { getEnabledModels } from "@/lib/models";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbConnected = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  return NextResponse.json({
    status: dbConnected ? "ok" : "degraded",
    models: getEnabledModels().map((model) => model.id),
    dbConnected,
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local"
  });
}
