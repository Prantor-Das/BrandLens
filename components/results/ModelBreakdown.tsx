"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { getStaggerStyle } from "@/lib/animations";
import { cn } from "@/lib/cn";
import type { ResultsAggregateItem, ResultsBrandResult, ResultsModelResponse } from "@/lib/results";

function SentimentDot({ sentiment }: { sentiment: string }) {
  const color =
    sentiment === "positive"
      ? "var(--color-success)"
      : sentiment === "negative"
        ? "var(--color-danger)"
        : "var(--foreground-subtle)";

  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

type ModelBreakdownProps = {
  aggregate: ResultsAggregateItem[];
  brandResults: ResultsBrandResult[];
  modelResponses: ResultsModelResponse[];
};

export function ModelBreakdown({
  aggregate,
  brandResults,
  modelResponses
}: ModelBreakdownProps) {
  const modelNames = useMemo(
    () => [...new Set(modelResponses.map((response) => response.modelName))],
    [modelResponses]
  );

  const winners = useMemo(() => {
    const result = new Map<string, string>();

    for (const modelName of modelNames) {
      const top = [...brandResults]
        .filter((item) => item.modelName === modelName)
        .sort((left, right) => right.visibilityScore - left.visibilityScore)[0];

      if (top) {
        result.set(modelName, top.brandName);
      }
    }

    const topAverage = [...aggregate].sort(
      (left, right) => right.avgVisibilityScore - left.avgVisibilityScore
    )[0];

    if (topAverage) {
      result.set("Average", topAverage.brandName);
    }

    return result;
  }, [aggregate, brandResults, modelNames]);

  return (
    <Card
      className="animate-fade-in-up overflow-hidden"
      padding="none"
      style={getStaggerStyle(1)}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Per-model breakdown</h2>
          <p className="text-sm text-[var(--foreground-muted)]">How each assistant ranked every brand</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[42rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background-elevated)_88%,transparent)] text-left">
              <th className="px-6 py-4 font-medium text-[var(--foreground-muted)]">Brand</th>
              {modelNames.map((modelName) => (
                <th key={modelName} className="px-4 py-4 font-medium text-[var(--foreground-muted)]">
                  {modelName}
                </th>
              ))}
              <th className="px-4 py-4 font-medium text-[var(--foreground-muted)]">Average</th>
            </tr>
          </thead>
          <tbody>
            {aggregate.map((brand) => (
              <tr key={brand.brandName} className="border-b border-[var(--border)] last:border-b-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-[var(--foreground)]">{brand.brandName}</span>
                    <span className="text-xs text-[var(--foreground-subtle)]">#{brand.rank}</span>
                  </div>
                </td>

                {modelNames.map((modelName) => {
                  const cell = brandResults.find(
                    (item) => item.brandName === brand.brandName && item.modelName === modelName
                  );
                  const isWinner = winners.get(modelName) === brand.brandName;

                  return (
                    <td key={`${brand.brandName}-${modelName}`} className="px-4 py-4">
                      <div
                        className={cn(
                          "inline-flex min-w-[88px] items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-2",
                          isWinner
                            ? "border-[color-mix(in_oklab,var(--color-brand)_26%,transparent)] bg-[color-mix(in_oklab,var(--color-brand)_12%,transparent)]"
                            : "border-transparent bg-transparent"
                        )}
                      >
                        <span className="font-medium text-[var(--foreground)]">
                          {Math.round(cell?.visibilityScore ?? 0)}
                        </span>
                        <SentimentDot sentiment={cell?.sentiment ?? "neutral"} />
                      </div>
                    </td>
                  );
                })}

                <td className="px-4 py-4">
                  <div
                    className={cn(
                      "inline-flex min-w-[88px] items-center justify-between gap-3 rounded-[var(--radius-md)] border px-3 py-2",
                      winners.get("Average") === brand.brandName
                        ? "border-[color-mix(in_oklab,var(--color-brand)_26%,transparent)] bg-[color-mix(in_oklab,var(--color-brand)_12%,transparent)]"
                        : "border-transparent bg-transparent"
                    )}
                  >
                    <span className="font-medium text-[var(--foreground)]">
                      {Math.round(brand.avgVisibilityScore)}
                    </span>
                    <SentimentDot sentiment={brand.dominantSentiment} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
