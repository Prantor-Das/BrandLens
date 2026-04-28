"use client";

import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Tooltip } from "@/components/ui/Tooltip";
import { ANALYSIS_STATUS_MESSAGES, BRAND_MODELS, type BrandModel } from "@/lib/brandlens-config";
import { cn } from "@/lib/cn";

const competitorInputSchema = z.string().trim().min(1).max(48);

const analysisSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(2, "Enter a brand name with at least 2 characters.")
    .max(48, "Keep the brand name under 48 characters."),
  competitors: z.array(z.string()).max(5, "You can compare up to 5 competitors."),
  customPrompt: z
    .string()
    .max(280, "Keep the custom prompt under 280 characters.")
    .optional()
    .transform((value) => value?.trim() ?? ""),
  models: z.array(z.enum(BRAND_MODELS)).min(1, "Select at least one model.")
});

type FormValues = z.infer<typeof analysisSchema>;
type FormErrors = Partial<Record<keyof FormValues | "competitorDraft", string>>;

const BRAND_LIMIT = 48;
const PROMPT_LIMIT = 280;
const TRUST_ITEMS = ["3 LLMs analysed", "Real-time scoring", "Actionable insights"] as const;

function SparklineIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 11L5.5 7.5L8 10L13 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M10.5 4.5H13V7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function LoadingOverlay({ open }: { open: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % ANALYSIS_STATUS_MESSAGES.length);
    }, 1450);

    return () => window.clearInterval(interval);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[var(--radius-xl)] bg-[color-mix(in_oklab,var(--background)_84%,transparent)] backdrop-blur-md">
      <div className="flex w-[min(26rem,calc(100%-2rem))] flex-col items-center gap-5 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--background-elevated)] px-6 py-7 text-center shadow-[var(--shadow-lg)]">
        <Spinner size="lg" />
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--foreground-subtle)]">Running analysis</p>
          <p className="min-h-7 text-lg font-medium text-[var(--foreground)] animate-fade-in-up">
            {ANALYSIS_STATUS_MESSAGES[open ? index : 0]}
          </p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
          <div className="animate-shimmer h-full w-full rounded-full bg-[var(--color-brand)] opacity-90" />
        </div>
      </div>
    </div>
  );
}

export function AnalysisForm() {
  const router = useRouter();
  const competitorRef = useRef<HTMLInputElement>(null);
  const [brandName, setBrandName] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorDraft, setCompetitorDraft] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [models, setModels] = useState<BrandModel[]>([...BRAND_MODELS]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const remainingBrandChars = BRAND_LIMIT - brandName.length;
  const remainingPromptChars = PROMPT_LIMIT - customPrompt.length;

  const addCompetitor = (rawValue: string) => {
    const parsed = competitorInputSchema.safeParse(rawValue);

    if (!parsed.success) {
      setErrors((current) => ({ ...current, competitorDraft: "Add a valid competitor name first." }));
      return false;
    }

    const nextValue = parsed.data;

    if (competitors.includes(nextValue)) {
      setErrors((current) => ({ ...current, competitorDraft: "That competitor is already added." }));
      return false;
    }

    if (competitors.length >= 5) {
      setErrors((current) => ({ ...current, competitors: "You can compare up to 5 competitors." }));
      return false;
    }

    setCompetitors((current) => [...current, nextValue]);
    setCompetitorDraft("");
    setErrors((current) => ({ ...current, competitorDraft: undefined, competitors: undefined }));
    setSubmitError("");
    return true;
  };

  const removeCompetitor = (name: string) => {
    setCompetitors((current) => current.filter((item) => item !== name));
    setErrors((current) => ({ ...current, competitors: undefined, competitorDraft: undefined }));
    setSubmitError("");
  };

  const toggleModel = (model: BrandModel) => {
    setModels((current) => {
      if (current.includes(model)) {
        if (current.length === 1) {
          setErrors((prev) => ({ ...prev, models: "Select at least one model." }));
          return current;
        }

        const next = current.filter((item) => item !== model);
        setErrors((prev) => ({ ...prev, models: undefined }));
        setSubmitError("");
        return next;
      }

      setErrors((prev) => ({ ...prev, models: undefined }));
      setSubmitError("");
      return [...current, model];
    });
  };

  const handleCompetitorKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== ",") {
      return;
    }

    event.preventDefault();
    addCompetitor(competitorDraft);
  };

  const handleCompetitorPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");

    if (!text.includes(",")) {
      return;
    }

    event.preventDefault();

    for (const part of text.split(",").map((value) => value.trim()).filter(Boolean)) {
      addCompetitor(part);
    }
  };

  const validateForm = () => {
    const result = analysisSchema.safeParse({
      brandName,
      competitors,
      customPrompt,
      models
    });

    if (result.success) {
      setErrors({});
      setSubmitError("");
      return result.data;
    }

    const nextErrors: FormErrors = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormValues | undefined;

      if (field && !nextErrors[field]) {
        nextErrors[field] = issue.message;
      }
    }

    setErrors(nextErrors);
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = validateForm();

    if (!payload) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          brand: payload.brandName,
          competitors: payload.competitors,
          prompt: payload.customPrompt || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Unable to start the analysis.");
      }

      const data = (await response.json()) as { jobId?: string };

      if (!data.jobId) {
        throw new Error("Missing job ID from analysis response.");
      }

      router.push(`/results/${data.jobId}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden" hover padding="lg">
      <LoadingOverlay open={submitting} />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Badge size="md" variant="info">
            Premium analysis workflow
          </Badge>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Launch a brand visibility scan</h2>
            <p className="max-w-xl text-sm leading-6 text-[var(--foreground-muted)]">
              Benchmark how AI assistants position your brand against competitors, then surface the exact prompts and signals worth improving.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TRUST_ITEMS.map((item) => (
            <Badge key={item} size="sm" variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <form className="space-y-6" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Input
            autoFocus
            error={errors.brandName}
            helperText={`${remainingBrandChars} characters remaining`}
            label="Brand name"
            leftIcon={<SparklineIcon />}
            maxLength={BRAND_LIMIT}
            onChange={(event) => setBrandName(event.target.value)}
            placeholder="Acme, Figma, Vercel..."
            value={brandName}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
              <span>Models</span>
              <Tooltip content="Choose the models you want BrandLens to query for this run.">
                <button
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-[11px] text-[var(--foreground-subtle)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
                  type="button"
                >
                  ?
                </button>
              </Tooltip>
            </div>
            <div className="flex flex-wrap gap-2">
              {BRAND_MODELS.map((model) => {
                const active = models.includes(model);

                return (
                  <button
                    key={model}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-[var(--transition-fast)]",
                      active
                        ? "border-[color-mix(in_oklab,var(--color-brand)_44%,transparent)] bg-[color-mix(in_oklab,var(--color-brand)_18%,transparent)] text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[color-mix(in_oklab,var(--background-elevated)_76%,transparent)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                    )}
                    onClick={() => toggleModel(model)}
                    type="button"
                  >
                    {model}
                  </button>
                );
              })}
            </div>
            {errors.models ? <p className="text-sm text-[var(--color-danger)]">{errors.models}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
            <span>Competitors</span>
            <span className="text-[var(--foreground-subtle)]">{competitors.length}/5 added</span>
          </div>
          <div
            className={cn(
              "rounded-[var(--radius-md)] border bg-[color-mix(in_oklab,var(--background-elevated)_84%,transparent)] px-3 py-3 transition-all duration-[var(--transition-fast)] focus-within:ring-2",
              errors.competitors || errors.competitorDraft
                ? "border-[color-mix(in_oklab,var(--color-danger)_45%,transparent)] focus-within:border-[var(--color-danger)] focus-within:ring-[color-mix(in_oklab,var(--color-danger)_20%,transparent)]"
                : "border-[var(--border)] focus-within:border-[color-mix(in_oklab,var(--color-brand)_40%,transparent)] focus-within:ring-[color-mix(in_oklab,var(--color-brand)_18%,transparent)]"
            )}
            onClick={() => competitorRef.current?.focus()}
          >
            <div className="flex flex-wrap items-center gap-2">
              {competitors.map((competitor) => (
                <span
                  key={competitor}
                  className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-brand)_24%,transparent)] bg-[color-mix(in_oklab,var(--color-brand)_14%,transparent)] px-3 py-1.5 text-sm text-[var(--foreground)]"
                >
                  {competitor}
                  <button
                    aria-label={`Remove ${competitor}`}
                    className="text-[var(--foreground-subtle)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
                    onClick={() => removeCompetitor(competitor)}
                    type="button"
                  >
                    x
                  </button>
                </span>
              ))}

              <input
                ref={competitorRef}
                className="min-w-[12rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]"
                onChange={(event) => setCompetitorDraft(event.target.value)}
                onKeyDown={handleCompetitorKeyDown}
                onPaste={handleCompetitorPaste}
                placeholder="Type a competitor and press Enter"
                value={competitorDraft}
              />
            </div>
          </div>
          {errors.competitors || errors.competitorDraft ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.competitors ?? errors.competitorDraft}</p>
          ) : (
            <p className="text-sm text-[var(--foreground-subtle)]">Press Enter or comma to add each competitor.</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
            onClick={() => setShowPrompt((current) => !current)}
            type="button"
          >
            <span>{showPrompt ? "Hide" : "Add"} a custom prompt</span>
            <span className={cn("transition-transform duration-[var(--transition-fast)]", showPrompt && "rotate-45")}>+</span>
          </button>

          {showPrompt ? (
            <label className="block animate-fade-in-up space-y-2">
              <span className="flex items-center justify-between text-sm font-medium text-[var(--foreground)]">
                <span>Custom prompt</span>
                <span
                  className={cn(
                    "text-xs",
                    remainingPromptChars < 40 ? "text-[var(--color-warning)]" : "text-[var(--foreground-subtle)]"
                  )}
                >
                  {remainingPromptChars} left
                </span>
              </span>
              <textarea
                className={cn(
                  "min-h-28 w-full resize-none rounded-[var(--radius-md)] border bg-[color-mix(in_oklab,var(--background-elevated)_84%,transparent)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition-all duration-[var(--transition-fast)] placeholder:text-[var(--foreground-subtle)] focus:ring-2",
                  errors.customPrompt
                    ? "border-[color-mix(in_oklab,var(--color-danger)_45%,transparent)] focus:border-[var(--color-danger)] focus:ring-[color-mix(in_oklab,var(--color-danger)_20%,transparent)]"
                    : "border-[var(--border)] focus:border-[color-mix(in_oklab,var(--color-brand)_40%,transparent)] focus:ring-[color-mix(in_oklab,var(--color-brand)_18%,transparent)]"
                )}
                maxLength={PROMPT_LIMIT}
                onChange={(event) => setCustomPrompt(event.target.value)}
                placeholder="Example: Analyse how our brand is described for B2B buyers evaluating AI observability tools."
                value={customPrompt}
              />
              {errors.customPrompt ? (
                <span className="text-sm text-[var(--color-danger)]">{errors.customPrompt}</span>
              ) : (
                <span className="text-sm text-[var(--foreground-subtle)]">
                  Optional context to steer the analysis toward a campaign, market, or buyer segment.
                </span>
              )}
            </label>
          ) : null}
        </div>

        <div className="space-y-3">
          <Button className="w-full" loading={submitting} size="lg" type="submit">
            Analyse now
          </Button>
          {submitError ? <p className="text-center text-sm text-[var(--color-danger)]">{submitError}</p> : null}
          <p className="text-center text-sm text-[var(--foreground-subtle)]">Typical analysis takes 15-30 seconds</p>
        </div>
      </form>
    </Card>
  );
}
