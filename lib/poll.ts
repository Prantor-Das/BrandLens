import type { AnalysisJob } from "@/lib/generated/prisma/client";

export function estimateProgress(job: AnalysisJob): number {
  if (job.status === "PENDING") {
    return 5;
  }

  if (job.status === "DONE" || job.status === "ERROR") {
    return 100;
  }

  const elapsedMs = Date.now() - job.createdAt.getTime();
  const progress = Math.round((elapsedMs / 30000) * 95);

  return Math.max(10, Math.min(95, progress));
}
