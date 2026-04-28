"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { ResultsModelResponse } from "@/lib/results";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="3" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 10.5V5.5C3.5 4.39543 4.39543 3.5 5.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

type RawResponsesProps = {
  brandNames: string[];
  modelResponses: ResultsModelResponse[];
};

export function RawResponses({ brandNames, modelResponses }: RawResponsesProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const highlightNames = useMemo(
    () => [...new Set(brandNames.map((name) => name.trim()).filter(Boolean))],
    [brandNames]
  );
  const pattern = useMemo(() => {
    if (highlightNames.length === 0) {
      return null;
    }

    return new RegExp(`(${highlightNames.map(escapeRegExp).join("|")})`, "gi");
  }, [highlightNames]);

  const highlightText = (text: string) => {
    if (!pattern) {
      return text;
    }

    const parts = text.split(pattern);

    return parts.map((part, index) =>
      highlightNames.some((name) => name.toLowerCase() === part.toLowerCase()) ? (
        <mark
          key={`${part}-${index}`}
          className="rounded px-1 py-0.5 text-[var(--foreground)]"
          style={{
            backgroundColor: "color-mix(in oklab, var(--color-warning) 42%, transparent)"
          }}
        >
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      )
    );
  };

  const copy = async (value: string, index: number) => {
    await navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    window.setTimeout(
      () => setCopiedIndex((current) => (current === index ? null : current)),
      1500
    );
  };

  return (
    <Card className="animate-fade-in-up" padding="lg" style={{ animationDelay: "260ms" }}>
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Raw LLM responses</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          The exact passages BrandLens scored for this run.
        </p>
      </div>

      <div className="space-y-3">
        {modelResponses.map((response, index) => {
          const open = openIndex === index;

          return (
            <div
              key={`${response.modelId}-${response.modelName}`}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background-elevated)_72%,transparent)]"
            >
              <div className="flex items-center gap-3 px-4 py-4">
                <button
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left"
                  onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                  type="button"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ChevronIcon open={open} />
                    <span className="truncate font-medium text-[var(--foreground)]">
                      {response.modelName}
                    </span>
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--foreground-muted)]">
                      {(response.durationMs / 1000).toFixed(1)}s
                    </span>
                  </div>

                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-muted)]">
                    <ChevronIcon open={open} />
                  </span>
                </button>

                <button
                  aria-label={`Copy raw response from ${response.modelName}`}
                  className="mr-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
                  onClick={() => void copy(response.rawResponse, index)}
                  type="button"
                >
                  <CopyIcon />
                </button>
              </div>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-[var(--border)] px-4 py-4">
                    <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--foreground-muted)]">
                      {highlightText(response.rawResponse)}
                    </pre>
                    {copiedIndex === index ? (
                      <p className="mt-3 text-xs text-[var(--foreground-subtle)]">Copied.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
