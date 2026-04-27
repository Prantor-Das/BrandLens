const stack = [
  "Next.js 16 App Router",
  "Tailwind CSS v4 theme tokens",
  "Prisma + PostgreSQL",
  "Zod env validation",
  "Parallel LLM orchestration"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12 md:px-10">
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[var(--radius-panel)] border border-black/5 bg-[var(--color-panel)] p-8 shadow-sm">
          <div className="mb-6 inline-flex rounded-[var(--radius-pill)] bg-[color-mix(in_oklab,var(--color-brand-primary)_12%,white)] px-3 py-1 text-sm font-medium text-[var(--color-brand-primary)]">
            Foundational scaffold ready
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl">
            BrandLens AI
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)] md:text-lg">
            Query multiple LLMs in parallel, extract brand mentions, score visibility, and turn the results into specific actions.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {stack.map((item) => (
              <div
                key={item}
                className="rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-surface)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-black/5 bg-[var(--color-panel)] p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Orchestration flow</h2>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-[var(--color-muted)]">
            <li>
              <span className="font-medium text-[var(--color-ink)]">1.</span> Build a shared prompt from the target brand, competitors, and task context.
            </li>
            <li>
              <span className="font-medium text-[var(--color-ink)]">2.</span> Fan out requests across enabled adapters with isolated retries and timing.
            </li>
            <li>
              <span className="font-medium text-[var(--color-ink)]">3.</span> Persist raw model outputs, extract mentions, score sentiment, and generate insights.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
