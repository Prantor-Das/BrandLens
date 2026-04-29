"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getStaggerStyle } from "@/lib/animations";
import type { ResultsInsight } from "@/lib/results";
import { useInsightStream } from "@/hooks/useInsightStream";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path
        d="M5 3.5H12.5V11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 12.5L12 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

type InsightsPanelProps = {
  brand: string;
  insights: ResultsInsight[];
};

export function InsightsPanel({ brand, insights }: InsightsPanelProps) {
  const { error, isStreaming, start, text } = useInsightStream();

  useEffect(() => {
    if (insights.length === 0) {
      return;
    }

    void start({ insights });
  }, [insights, start]);

  const streamedText = text.trim();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          How to improve {brand}&apos;s AI presence
        </h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          The sharpest next moves from this analysis run.
        </p>
      </div>

      <div className="space-y-3">
        {streamedText ? (
          <Card className="animate-slide-in-right" padding="lg">
            <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--foreground-muted)]">
              {streamedText}
              {isStreaming ? <span className="animate-pulse-soft">|</span> : null}
            </p>
          </Card>
        ) : null}
        {error ? (
          <p className="text-sm text-[var(--foreground-subtle)]">
            Showing saved insights because the live stream is unavailable.
          </p>
        ) : null}

        {insights.slice(0, 3).map((insight, index) => (
          <Card
            key={`${insight.title}-${index}`}
            className="animate-slide-in-right"
            hover
            padding="lg"
            style={getStaggerStyle(index)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge
                  size="sm"
                  variant={
                    insight.priority === "high"
                      ? "danger"
                      : insight.priority === "medium"
                        ? "warning"
                        : "outline"
                  }
                >
                  {insight.priority} priority
                </Badge>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{insight.title}</h3>
                  <p className="text-sm leading-6 text-[var(--foreground-muted)]">{insight.description}</p>
                </div>
              </div>

              <span className="mt-0.5 text-[var(--foreground-subtle)]">
                <ArrowIcon />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
