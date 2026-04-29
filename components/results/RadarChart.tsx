"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import { Card } from "@/components/ui/Card";
import { getStaggerStyle } from "@/lib/animations";
import type { ResultsAggregateItem, ResultsBrandResult } from "@/lib/results";

const BRAND_TONES = [
  "var(--color-brand)",
  "oklch(68% 0.19 155)",
  "oklch(67% 0.18 20)",
  "oklch(72% 0.18 85)",
  "oklch(71% 0.16 300)",
  "oklch(70% 0.16 215)"
] as const;

const METRICS = [
  { key: "visibility", label: "Visibility" },
  { key: "mentions", label: "Mentions" },
  { key: "position", label: "Position Score" },
  { key: "sentiment", label: "Sentiment" },
  { key: "coverage", label: "Coverage" }
] as const;

function positionToScore(position: number | null) {
  if (position === 1) {
    return 100;
  }

  if (position === 2) {
    return 72;
  }

  if (position === 3) {
    return 48;
  }

  if (position && position < 999) {
    return 24;
  }

  return 0;
}

type ResultsRadarChartProps = {
  aggregate: ResultsAggregateItem[];
  brandResults: ResultsBrandResult[];
};

export function ResultsRadarChart({
  aggregate,
  brandResults
}: ResultsRadarChartProps) {
  const maxMentions = Math.max(...aggregate.map((item) => item.totalMentions), 1);
  const totalModels = Math.max(
    new Set(brandResults.map((item) => item.modelName)).size,
    1
  );

  const series = aggregate.map((item, index) => {
    const matches = brandResults.filter(
      (brandResult) => brandResult.brandName === item.brandName
    );
    const averageSentiment =
      matches.reduce((sum, current) => sum + current.sentimentScore, 0) /
      Math.max(matches.length, 1);
    const bestPosition =
      matches
        .map((brandResult) => brandResult.firstPosition)
        .filter((value): value is number => value !== null && value < 999)
        .sort((left, right) => left - right)[0] ?? null;

    return {
      brandName: item.brandName,
      color: BRAND_TONES[index % BRAND_TONES.length],
      values: {
        visibility: Math.round(item.avgVisibilityScore),
        mentions: Math.round((item.totalMentions / maxMentions) * 100),
        position: positionToScore(bestPosition),
        sentiment: Math.round(((averageSentiment + 1) / 2) * 100),
        coverage: Math.round((item.modelsPresent / totalModels) * 100)
      }
    };
  });

  const data = METRICS.map((metric) => {
    const point: Record<string, number | string> = {
      metric: metric.label
    };

    for (const brand of series) {
      point[brand.brandName] = brand.values[metric.key];
    }

    return point;
  });

  return (
    <Card className="animate-fade-in-up" padding="lg" style={getStaggerStyle(2)}>
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Brand footprint radar</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          A side-by-side read on visibility, mention depth, ordering, tone, and coverage.
        </p>
      </div>

      <div className="h-[300px] min-h-[300px] w-full min-w-0 sm:h-[360px] sm:min-h-[360px]">
        <ResponsiveContainer height="100%" minHeight={300} minWidth={0} width="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
            />
            <RechartsTooltip
              contentStyle={{
                border: "1px solid var(--border)",
                borderRadius: "12px",
                background: "var(--background-elevated)",
                color: "var(--foreground)"
              }}
            />
            {series.map((brand) => (
              <Radar
                key={brand.brandName}
                dataKey={brand.brandName}
                fill={brand.color}
                fillOpacity={0.14}
                name={brand.brandName}
                stroke={brand.color}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {series.map((brand) => (
          <div
            key={brand.brandName}
            className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)]"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: brand.color }}
            />
            <span>{brand.brandName}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
