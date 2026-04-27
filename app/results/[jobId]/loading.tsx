import { Card } from "@/components/ui/Card";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--foreground)_9%,transparent)] ${className ?? ""}`}
    />
  );
}

export default function ResultsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 md:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card padding="lg">
          <div className="space-y-5">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="h-12 w-4/5" />
            <SkeletonBlock className="h-5 w-3/5" />
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background-soft)_74%,transparent)] p-4"
                >
                  <SkeletonBlock className="mb-4 h-4 w-20" />
                  <SkeletonBlock className="h-10 w-16" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="space-y-4">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-11/12" />
            <SkeletonBlock className="h-32 w-full rounded-[var(--radius-lg)]" />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card padding="lg">
          <div className="space-y-5">
            <SkeletonBlock className="h-5 w-32" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonBlock className="h-4 w-2/5" />
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-5/6" />
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} padding="lg">
              <div className="space-y-4">
                <SkeletonBlock className="h-5 w-36" />
                <SkeletonBlock className="h-20 w-full rounded-[var(--radius-lg)]" />
                <SkeletonBlock className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
