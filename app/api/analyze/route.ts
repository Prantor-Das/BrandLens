import { NextResponse } from "next/server";
import { z } from "zod";
import { BRAND_MODELS } from "@/lib/brandlens-config";

const requestSchema = z.object({
  brandName: z.string().trim().min(2).max(48),
  competitors: z.array(z.string().trim().min(1).max(48)).max(5),
  customPrompt: z.string().max(280).optional(),
  models: z.array(z.enum(BRAND_MODELS)).min(1)
});

export async function POST(request: Request) {
  const json = await request.json();
  const payload = requestSchema.parse(json);

  const jobId = `job_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  return NextResponse.json({
    jobId,
    acceptedAt: new Date().toISOString(),
    request: payload
  });
}
