import type { ScoreParams } from "@/lib/types";

export function calculateVisibilityScore(params: ScoreParams): number {
  if (params.mentions <= 0 || params.modelsPresent <= 0 || params.firstPosition >= 999) {
    return 0;
  }

  const mentionScore = Math.min(params.mentions / 5, 1) * 30;
  const positionScore =
    params.firstPosition >= 999
      ? 0
      : Math.max(0, 25 - (params.firstPosition - 1) * 4);
  const coverageScore =
    params.totalModels > 0
      ? (params.modelsPresent / params.totalModels) * 30
      : 0;
  const sentimentBonus = ((params.sentimentScore + 1) / 2) * 15;

  return Math.round(
    Math.min(100, Math.max(0, mentionScore + positionScore + coverageScore + sentimentBonus))
  );
}

export function getScoreLabel(
  score: number
): "dominant" | "strong" | "present" | "weak" | "absent" {
  if (score >= 80) {
    return "dominant";
  }

  if (score >= 60) {
    return "strong";
  }

  if (score >= 40) {
    return "present";
  }

  if (score >= 20) {
    return "weak";
  }

  return "absent";
}
