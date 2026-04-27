import type { ScoreParams } from "@/lib/types";

export function calculateVisibilityScore(params: ScoreParams): number {
  const mentionScore = Math.min(params.mentions * 2, 20);
  const positionScore =
    params.firstPosition === 1
      ? 30
      : params.firstPosition === 2
        ? 20
        : params.firstPosition === 3
          ? 10
          : params.firstPosition < 999
            ? 5
            : 0;
  const coverageScore = (params.modelsPresent / params.totalModels) * 35;
  const sentimentBonus = params.sentimentScore * 15;

  return Math.round(
    Math.min(
      100,
      Math.max(0, mentionScore + positionScore + coverageScore + sentimentBonus)
    )
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
