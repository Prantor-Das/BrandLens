import type { AggregateBrandScore, PerModelResult, SentimentResult } from "@/lib/types";

const SENTIMENT_PRIORITY: SentimentResult["sentiment"][] = [
  "positive",
  "neutral",
  "negative"
];

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function getDominantSentiment(
  sentiments: SentimentResult["sentiment"][],
  averageSentimentScore: number
): SentimentResult["sentiment"] {
  if (sentiments.length === 0) {
    return "neutral";
  }

  const counts = new Map<SentimentResult["sentiment"], number>();

  for (const sentiment of sentiments) {
    counts.set(sentiment, (counts.get(sentiment) ?? 0) + 1);
  }

  let best = sentiments[0];
  let bestCount = counts.get(best) ?? 0;

  for (const candidate of SENTIMENT_PRIORITY) {
    const candidateCount = counts.get(candidate) ?? 0;

    if (candidateCount > bestCount) {
      best = candidate;
      bestCount = candidateCount;
      continue;
    }

    if (candidateCount !== bestCount || candidateCount === 0) {
      continue;
    }

    if (averageSentimentScore > 0 && candidate === "positive") {
      best = candidate;
    } else if (averageSentimentScore < 0 && candidate === "negative") {
      best = candidate;
    } else if (averageSentimentScore === 0 && candidate === "neutral") {
      best = candidate;
    }
  }

  return best;
}

export function aggregateAcrossModels(
  perModelResults: PerModelResult[],
  totalModels: number
): AggregateBrandScore[] {
  const grouped = new Map<
    string,
    {
      totalVisibilityScore: number;
      totalSentimentScore: number;
      sentiments: SentimentResult["sentiment"][];
      totalMentions: number;
      modelsPresent: number;
      appearances: number;
    }
  >();

  for (const modelResult of perModelResults) {
    for (const brandResult of modelResult.brands) {
      const current = grouped.get(brandResult.brand) ?? {
        totalVisibilityScore: 0,
        totalSentimentScore: 0,
        sentiments: [],
        totalMentions: 0,
        modelsPresent: 0,
        appearances: 0
      };

      current.totalVisibilityScore += brandResult.visibilityScore;
      current.totalSentimentScore += brandResult.sentiment.score;
      current.sentiments.push(brandResult.sentiment.sentiment);
      current.totalMentions += brandResult.mentions;
      current.modelsPresent += brandResult.mentions > 0 ? 1 : 0;
      current.appearances += 1;

      grouped.set(brandResult.brand, current);
    }
  }

  const aggregate = Array.from(grouped.entries()).map(([brand, data]) => {
    const divisor = totalModels > 0 ? totalModels : Math.max(data.appearances, 1);
    const averageVisibilityScore = roundToTwoDecimals(
      data.totalVisibilityScore / divisor
    );
    const averageSentimentScore = roundToTwoDecimals(
      data.totalSentimentScore / Math.max(data.appearances, 1)
    );

    return {
      brand,
      averageVisibilityScore,
      dominantSentiment: getDominantSentiment(
        data.sentiments,
        averageSentimentScore
      ),
      totalMentions: data.totalMentions,
      modelsPresent: data.modelsPresent,
      averageSentimentScore,
      rank: 0,
      delta: 0
    };
  });

  aggregate.sort((left, right) => {
    if (right.averageVisibilityScore !== left.averageVisibilityScore) {
      return right.averageVisibilityScore - left.averageVisibilityScore;
    }

    if (right.totalMentions !== left.totalMentions) {
      return right.totalMentions - left.totalMentions;
    }

    return left.brand.localeCompare(right.brand);
  });

  const topScore = aggregate[0]?.averageVisibilityScore ?? 0;

  return aggregate.map((item, index): AggregateBrandScore => ({
    ...item,
    rank: index + 1,
    delta: roundToTwoDecimals(topScore - item.averageVisibilityScore)
  }));
}
