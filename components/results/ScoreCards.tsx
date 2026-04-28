"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { animationClasses, getStaggerStyle, useCountUp } from "@/lib/animations";
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

function CrownIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path d="M3 14.5L4.8 5.5L10 10L15.2 5.5L17 14.5H3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <circle cx="4.75" cy="5.25" r="1.25" fill="currentColor" />
      <circle cx="10" cy="3.75" r="1.25" fill="currentColor" />
      <circle cx="15.25" cy="5.25" r="1.25" fill="currentColor" />
    </svg>
  );
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
      const matches = brandResults.filter((brandResult) => brandResult.brandName === item.brandName);
      const firstPosition =
        matches
          .map((brandResult) => brandResult.firstPosition)
          .filter((value): value is number => value !== null && value < 999)
          .sort((left, right) => left - right)[0] ?? null;

      return {
        ...item,
        firstPosition,
        isMissing: item.totalMentions === 0 || item.modelsPresent === 0,
        tone: BRAND_TONES[index % BRAND_TONES.length],
        mentionText:
          item.totalMentions > 0
            ? `Mentioned ${item.totalMentions} times${firstPosition ? `, first at position ${firstPosition}` : ""}.`
            : "Not mentioned in any model response."
      };
    });
  }, [aggregate, brandResults]);

  const leader = summaries[0];

  return (
    <section className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {summaries.map((item, index) => (
        <ScoreCard
          key={item.brandName}
          delay={index}
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
  isMissing: boolean;
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
  isMissing,
  isPrimary,
  leader,
  mentionText,
  rank,
  tone
}: ScoreCardProps) {
  const score = useCountUp(Math.round(avgVisibilityScore));
  const isWinner = rank === 1;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        animationClasses.fadeInUp,
        isPrimary
          ? "lg:scale-[1.02] border-l-4 shadow-[0_20px_60px_color-mix(in_oklab,var(--color-brand)_15%,transparent)]"
          : "border-l border-l-[var(--border)]"
      )}
      hover
      padding="lg"
      style={{
        ...getStaggerStyle(delay),
        borderLeftColor: isPrimary ? tone : "var(--border)"
      }}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            {isPrimary ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
                Your brand
              </p>
            ) : null}
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--foreground-muted)]">{brandName}</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{score}</span>
                <span className="pb-1 text-sm text-[var(--foreground-subtle)]">/100</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge size="sm" variant={isWinner ? "info" : "outline"}>
              #{rank}
            </Badge>
            {isWinner ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--color-warning)_24%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_12%,transparent)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-warning)]">
                <CrownIcon />
                AI&apos;s top pick
              </span>
            ) : null}
          </div>
        </div>

        <ProgressBar index={delay} label="Visibility score" value={avgVisibilityScore} />

        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" variant={getSentimentVariant(dominantSentiment)}>
            {dominantSentiment}
          </Badge>
          <span className="text-sm text-[var(--foreground-muted)]">
            {delta === 0 ? "Leading this analysis" : `${Math.round(delta)} pts behind ${leader}`}
          </span>
        </div>

        <div
          className={cn(
            "rounded-[var(--radius-lg)] border px-4 py-3 text-sm",
            isMissing
              ? "border-[color-mix(in_oklab,var(--color-warning)_24%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_10%,transparent)] text-[var(--foreground)]"
              : "border-[var(--border)] bg-[color-mix(in_oklab,var(--background-elevated)_74%,transparent)] text-[var(--foreground-muted)]"
          )}
        >
          {isMissing ? (
            <div className="space-y-2">
              <p className="font-medium text-[var(--foreground)]">Brand not found in model responses</p>
              <p className="text-[var(--foreground-muted)]">
                None of the selected models mentioned {brandName}. Try adding category context, stronger differentiators, or a more specific buying scenario so the brand has more retrieval hooks.
              </p>
            </div>
          ) : (
            <p>
              {mentionText} {firstPosition === 1 ? "Appears first in at least one model." : "Needs stronger first-mention authority."}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
