import Link from "next/link";
import { AnalysisForm } from "@/components/analysis-form";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const featureRows = [
  {
    eyebrow: "Cross-model benchmarking",
    title: "See where your brand stands across the assistants buyers trust most.",
    body: "BrandLens runs the same brief across flagship models, normalises the language they use, and exposes who gets mentioned first, why, and with what sentiment."
  },
  {
    eyebrow: "Actionable inputs",
    title: "Turn vague visibility issues into concrete prompt and positioning fixes.",
    body: "Spot missing themes, weak proof points, and competitors who consistently outrank you before it shows up in pipeline conversations."
  }
];

const quickStats = [
  { label: "Coverage score", value: 82 },
  { label: "Recall quality", value: 68 },
  { label: "Competitive resilience", value: 91 }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 py-10 md:px-8 md:py-16">
      <section className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="space-y-8 pt-4">
          <div className="space-y-5">
            <Badge size="md" variant="outline">
              Brand intelligence for the AI era
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] text-[var(--foreground)] md:text-7xl">
                How does AI talk about your brand?
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--foreground-muted)] md:text-xl">
                Query ChatGPT, Gemini, and Claude simultaneously. See exactly where you rank and how to improve.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {["3 LLMs analysed", "Real-time scoring", "Actionable insights"].map((item) => (
              <Badge key={item} size="md" variant="default">
                {item}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {quickStats.map((stat) => (
              <Card key={stat.label} hover padding="sm">
                <div className="space-y-3">
                  <p className="text-sm text-[var(--foreground-muted)]">{stat.label}</p>
                  <ProgressBar label={stat.label} value={stat.value} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <AnalysisForm />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]" id="how-it-works">
        <Card hover padding="lg">
          <div className="space-y-8">
            <div className="space-y-3">
              <Badge size="sm" variant="info">
                How it works
              </Badge>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                A clean workflow from prompt input to brand visibility scoring.
              </h2>
            </div>

            <div className="space-y-5">
              {[
                "Capture your brand, competitors, and optional context.",
                "Query top-tier LLMs in parallel against the same market framing.",
                "Extract mentions, score performance, and reveal the biggest gaps."
              ].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--background-soft)_88%,transparent)] text-sm font-semibold text-[var(--foreground)]">
                    0{index + 1}
                  </div>
                  <p className="pt-1 text-base leading-7 text-[var(--foreground-muted)]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          {featureRows.map((feature) => (
            <Card key={feature.title} hover padding="lg">
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                  {feature.eyebrow}
                </p>
                <h3 className="text-2xl font-semibold tracking-[-0.025em] text-[var(--foreground)]">{feature.title}</h3>
                <p className="text-base leading-7 text-[var(--foreground-muted)]">{feature.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card padding="lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge size="sm" variant="success">
                Ready for judging
              </Badge>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Built to feel credible in front of founders, operators, and product teams.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
                Every surface is tuned for clarity: restrained color, crisp typography, responsive spacing, and motion that signals quality without becoming noisy.
              </p>
            </div>

            <Link
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition-all duration-[var(--transition-fast)] hover:border-[var(--border-strong)] hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]"
              href="#how-it-works"
            >
              View sample workflow
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
