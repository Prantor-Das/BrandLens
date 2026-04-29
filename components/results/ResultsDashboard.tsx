"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InsightsPanel } from "@/components/results/InsightsPanel";
import { ModelBreakdown } from "@/components/results/ModelBreakdown";
import { RawResponses } from "@/components/results/RawResponses";
import { ResultsRadarChart } from "@/components/results/RadarChart";
import { ScoreCards } from "@/components/results/ScoreCards";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { animationClasses, getStaggerStyle } from "@/lib/animations";
import type { ResultsApiPayload } from "@/lib/results";
import { getScoreLabel } from "@/lib/results";

const TOTAL_ESTIMATED_SECONDS = 30;

const MODEL_STYLES: Record<string, { color: string; label: string }> = {
  openai: { color: "oklch(63% 0.18 250)", label: "GPT" },
  gpt: { color: "oklch(63% 0.18 250)", label: "GPT" },
  gemini: { color: "oklch(68% 0.19 155)", label: "Gemini" },
  claude: { color: "oklch(68% 0.16 300)", label: "Claude" },
  deepseek: { color: "oklch(63% 0.18 255)", label: "DeepSeek" }
};

function SparklineIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M2 11L5.5 7.5L8 10L13 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M10.5 4.5H13V7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8H12.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M8.5 4L12.5 8L8.5 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function CopyLinkIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M6.25 9.75L9.75 6.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M6 12.5H4.75C3.50736 12.5 2.5 11.4926 2.5 10.25V9C2.5 7.75736 3.50736 6.75 4.75 6.75H6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3.5H11.25C12.4926 3.5 13.5 4.50736 13.5 5.75V7C13.5 8.24264 12.4926 9.25 11.25 9.25H10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5V9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M5 7.5L8 10.5L11 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M3 12.5H13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

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

function getModelPresentation(modelId: string) {
  const normalized = modelId.toLowerCase();
  const match = Object.entries(MODEL_STYLES).find(([key]) =>
    normalized.includes(key)
  );

  return match?.[1] ?? { color: "var(--foreground-subtle)", label: normalized.slice(0, 3).toUpperCase() };
}

function isFreeResultModel(modelId: string) {
  return modelId.toLowerCase().includes("deepseek");
}

function formatSeconds(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function isAllModelsTimedOut(message: string | undefined, data?: ResultsApiPayload | null) {
  const normalized = message?.toLowerCase() ?? "";
  return (
    normalized.includes("timed out") &&
    Boolean(data?.enabledModels?.length) &&
    (data?.modelResponses.length ?? 0) === 0
  );
}

function LiveProgressView({ data }: { data: ResultsApiPayload }) {
  const modelSteps = data.enabledModels.map((modelId) => `Querying ${getModelPresentation(modelId).label}...`);
  const steps = [...modelSteps, "Extracting brand mentions...", "Computing scores...", "Generating insights..."];
  const [stepIndex, setStepIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_ESTIMATED_SECONDS);
  const progress = data.percentComplete ?? 5;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % Math.max(steps.length, 1));
    }, 1600);

    return () => window.clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    const update = () => {
      const createdAt = data.createdAt ? new Date(data.createdAt).getTime() : Date.now();
      const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
      const projected = progress > 0 ? Math.ceil((elapsed * (100 - progress)) / progress) : TOTAL_ESTIMATED_SECONDS;
      const fallback = Math.max(TOTAL_ESTIMATED_SECONDS - elapsed, 3);
      setRemainingSeconds(Math.max(3, Math.min(projected || fallback, TOTAL_ESTIMATED_SECONDS)));
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [data.createdAt, progress]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <Badge size="md" variant="info">
            Live analysis
          </Badge>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Building {data.brand}&apos;s AI visibility report
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--foreground-muted)]">
            We&apos;re running the selected models, extracting mentions, and turning the raw outputs into scoreable signals.
          </p>
        </div>

        <Card className="overflow-hidden" padding="lg">
          <div className="space-y-6">
            <ProgressBar className={animationClasses.fadeInUp} label="Overall progress" value={progress} />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className={`min-h-7 text-lg font-medium text-[var(--foreground)] ${animationClasses.fadeInUp}`}>
                  {steps[stepIndex] ?? "Preparing analysis..."}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">Estimated time remaining: {formatSeconds(remainingSeconds)}</p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {data.enabledModels.map((modelId) => {
                  const model = getModelPresentation(modelId);

                  return (
                    <span
                      key={modelId}
                      className="inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                      style={{ backgroundColor: model.color }}
                    >
                      {model.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

function ErrorView({ brand, message, timedOut }: { brand: string; message: string; timedOut?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
      <Card className="w-full max-w-xl" padding="lg">
        <div className="space-y-4">
          <Badge size="sm" variant="danger">
            Analysis failed
          </Badge>
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {timedOut ? "All AI models timed out. Please try again." : `We couldn&apos;t finish ${brand || "this"} report.`}
            </h1>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">{message}</p>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]" href="/">
            <ArrowRightIcon />
            Start a new analysis
          </Link>
        </div>
      </Card>
    </main>
  );
}

type ResultsDashboardProps = {
  initialData: ResultsApiPayload;
  jobId: string;
};

export function ResultsDashboard({ initialData, jobId }: ResultsDashboardProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(initialData.status === "PENDING" || initialData.status === "RUNNING");
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const isDemo = jobId === "demo";

  useEffect(() => {
    if (isDemo) {
      return;
    }

    let cancelled = false;
    let timeoutId = 0;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results/${jobId}`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Unable to load the analysis results.");
        }

        const payload = (await response.json()) as ResultsApiPayload;

        if (cancelled) {
          return;
        }

        setData(payload);
        setError(null);
        setLoading(payload.status === "PENDING" || payload.status === "RUNNING");

        if (payload.status === "PENDING" || payload.status === "RUNNING") {
          timeoutId = window.setTimeout(fetchResults, 2000);
        }
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Something went wrong.");
        setLoading(false);
      }
    };

    if (initialData.status === "PENDING" || initialData.status === "RUNNING") {
      void fetchResults();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [initialData.status, isDemo, jobId]);

  if (error && !data) {
    return <ErrorView brand="" message={error} timedOut={isAllModelsTimedOut(error, data)} />;
  }

  if (loading && !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <Card className="w-full max-w-xl" padding="lg">
          <div className="space-y-4">
            <Badge size="sm" variant="outline">
              Preparing dashboard
            </Badge>
            <ProgressBar label="Loading result set" value={28} />
          </div>
        </Card>
      </main>
    );
  }

  if (error) {
    return <ErrorView brand={data.brand} message={error} timedOut={isAllModelsTimedOut(error, data)} />;
  }

  if (data.status === "PENDING" || data.status === "RUNNING") {
    return <LiveProgressView data={data} />;
  }

  if (data.status === "ERROR") {
    return <ErrorView brand={data.brand} message={data.error ?? "Analysis failed."} timedOut={isAllModelsTimedOut(data.error, data)} />;
  }

  const totalDurationSeconds = data.modelResponses.reduce((sum, response) => sum + response.durationMs, 0) / 1000;
  const freeModelCount = data.modelResponses.filter((response) => isFreeResultModel(response.modelId)).length;
  const brandSummary = data.aggregate.find((item) => item.brandName === data.brand) ?? data.aggregate[0] ?? null;
  const topCompetitor = data.aggregate.find((item) => item.brandName !== data.brand)?.brandName ?? "No competitor";
  const score = Math.round(brandSummary?.avgVisibilityScore ?? 0);
  const scoreLabel = getScoreLabel(score);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 1500);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.brand.toLowerCase().replace(/\s+/g, "-")}-brandlens-results.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:px-8 md:py-14">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className={animationClasses.fadeInUp} padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge size="md" variant="info">
                    {isDemo ? "Interactive demo" : "Results dashboard"}
                  </Badge>
                  {isDemo ? (
                    <Badge size="sm" variant="success">
                      Judges can explore this instantly
                    </Badge>
                  ) : null}
                  {data.competitors.map((competitor) => (
                    <Badge key={competitor} size="sm" variant="outline">
                      {competitor}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <h1 className="text-balance text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                    {data.brand}
                  </h1>
                  <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                    Analysed {data.modelResponses.length} models{freeModelCount > 0 ? ` (${freeModelCount} free)` : ""} {"\u00b7"} {totalDurationSeconds.toFixed(1)} seconds {"\u00b7"} Top competitor: {topCompetitor}
                  </p>
                </div>
              </div>
            </div>

            <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium text-[var(--foreground-muted)] transition-all duration-[var(--transition-fast)] ease-out hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:text-[var(--foreground)]" href="/">
              <SparklineIcon />
              <span>{isDemo ? "Run your own analysis" : "New analysis"}</span>
            </Link>
          </div>
        </Card>

        <Card className={animationClasses.fadeInUp} padding="lg" style={{ animationDelay: "80ms" }}>
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">Score summary</p>
            <div className="space-y-2">
              <p className="text-sm text-[var(--foreground-muted)]">{data.brand} scored</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-semibold tracking-tight text-[var(--foreground)]">{score}</span>
                <span className="pb-1 text-base text-[var(--foreground-subtle)]">/100</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm" variant="info">
                {scoreLabel}
              </Badge>
              <span className="text-sm text-[var(--foreground-muted)]">Rank #{brandSummary?.rank ?? "-"} across this prompt set</span>
              {brandSummary?.rank === 1 ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-warning)_22%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_12%,transparent)] px-3 py-1 text-xs font-medium text-[var(--color-warning)]">
                  <CrownIcon />
                  AI&apos;s top pick
                </span>
              ) : null}
            </div>
            <ProgressBar label={`${data.brand} visibility`} value={score} />
          </div>
        </Card>
      </section>

      <ScoreCards aggregate={data.aggregate} brandResults={data.brandResults} primaryBrand={data.brand} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ModelBreakdown aggregate={data.aggregate} brandResults={data.brandResults} modelResponses={data.modelResponses} />
        <InsightsPanel brand={data.brand} insights={data.insights} />
      </section>

      <ResultsRadarChart aggregate={data.aggregate} brandResults={data.brandResults} />

      <RawResponses brandNames={[data.brand, ...data.competitors]} modelResponses={data.modelResponses} />

      <Card className={animationClasses.fadeInUp} padding="lg" style={getStaggerStyle(4)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Share or export</h2>
            <p className="text-sm text-[var(--foreground-muted)]">Send the dashboard around or pull the full result payload for follow-up work.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button leftIcon={<CopyLinkIcon />} onClick={() => void copyLink()} variant="secondary">
              {copiedLink ? "Copied link" : "Copy link"}
            </Button>
            <Button leftIcon={<DownloadIcon />} onClick={downloadJson} variant="secondary">
              Download JSON
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
