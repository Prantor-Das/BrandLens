"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import type { ResultsAggregateItem, ResultsBrandResult } from "@/lib/results";

const BRAND_TONES = [
  "var(--color-brand)",
  "oklch(68% 0.19 155)",
  "oklch(67% 0.18 20)",
  "oklch(72% 0.18 85)",
  "oklch(71% 0.16 300)",
  "oklch(70% 0.16 215)"
] as const;

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, target]);

  return value;
}

function getSentimentVariant(sentiment: string) {
  if (sentiment === "positive") {
    return "success";
  }

  if (sentiment === "negative") {
    return "danger";
  }

  return "outline";
}

type ScoreCardsProps = {
  aggregate: ResultsAggregateItem[];
  brandResults: ResultsBrandResult[];
  primaryBrand: string;
};

export function ScoreCards({ aggregate, brandResults, primaryBrand }: ScoreCardsProps) {
  const summaries = useMemo(() => {
    return aggregate.map((item, index) => {
      const matches = brandResults.filter(
        (brandResult) => brandResult.brandName === item.brandName
      );
      const firstPosition =
        matches
          .map((brandResult) => brandResult.firstPosition)
          .filter((value): value is number => value !== null && value < 999)
          .sort((left, right) => left - right)[0] ?? null;

      return {
        ...item,
        firstPosition,
        tone: BRAND_TONES[index % BRAND_TONES.length],
        mentionText:
          item.totalMentions > 0
            ? `mentioned ${item.totalMentions}x${firstPosition ? `, first at position ${firstPosition}` : ""}`
            : "not mentioned in this run"
      };
    });
  }, [aggregate, brandResults]);

  const leader = summaries[0];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaries.map((item, index) => (
        <ScoreCard
          key={item.brandName}
          delay={index * 70}
          isPrimary={item.brandName === primaryBrand}
          leader={leader?.brandName ?? item.brandName}
          {...item}
        />
      ))}
    </section>
  );
}

type ScoreCardProps = ResultsAggregateItem & {
  delay: number;
  firstPosition: number | null;
  isPrimary: boolean;
  leader: string;
  mentionText: string;
  tone: string;
};

function ScoreCard({
  avgVisibilityScore,
  brandName,
  delay,
  delta,
  dominantSentiment,
  firstPosition,
  isPrimary,
  leader,
  mentionText,
  rank,
  tone
}: ScoreCardProps) {
  const score = useCountUp(avgVisibilityScore);

  return (
    <Card
      className={cn(
        "animate-fade-in-up overflow-hidden border-l-[3px]",
        isPrimary && "shadow-[0_20px_60px_color-mix(in_oklab,var(--color-brand)_15%,transparent)]"
      )}
      hover
      padding="lg"
      style={{
        animationDelay: `${delay}ms`,
        borderLeftColor: tone
      }}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--foreground-muted)]">{brandName}</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                {score}
              </span>
              <span className="text-sm text-[var(--foreground-subtle)]">/100</span>
            </div>
          </div>
          <Badge size="sm" variant={rank === 1 ? "info" : "outline"}>
            #{rank}
          </Badge>
        </div>

        <ProgressBar label="Visibility score" value={avgVisibilityScore} />

        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" variant={getSentimentVariant(dominantSentiment)}>
            {dominantSentiment}
          </Badge>
          <span className="text-sm text-[var(--foreground-muted)]">
            {delta === 0 ? "Leading this analysis" : `-${Math.round(delta)} pts behind ${leader}`}
          </span>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background-elevated)_74%,transparent)] px-4 py-3 text-sm text-[var(--foreground-muted)]">
          {mentionText}
          {firstPosition === 1 ? " and appears first." : "."}
        </div>
      </div>
    </Card>
  );
}
