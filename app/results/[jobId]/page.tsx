import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

type ResultsPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { jobId } = await params;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-8 md:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card padding="lg">
          <div className="space-y-5">
            <Badge size="sm" variant="info">
              Analysis queued
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.035em] text-[var(--foreground)]">
                Brand analysis started successfully.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--foreground-muted)]">
                Your request has been accepted under <span className="font-mono text-[var(--foreground)]">{jobId}</span>. This
                route is ready for the full results experience, and the loading shell is already in place for the next build step.
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">Preview state</p>
            <ProgressBar label="Pipeline readiness" value={78} />
            <ProgressBar label="UI completeness" value={86} />
            <ProgressBar label="Analysis handoff" value={71} />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          "Scores and mention share",
          "Model-by-model breakdown",
          "Prioritised recommendations"
        ].map((item) => (
          <Card key={item} hover padding="lg">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold tracking-[-0.025em] text-[var(--foreground)]">{item}</h2>
              <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                This slot is intentionally shaped to match the upcoming results implementation so there is no dead-end after form submission.
              </p>
            </div>
          </Card>
        ))}
      </section>

      <div>
        <Link
          className="text-sm font-medium text-[var(--foreground-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
          href="/"
        >
          Go back
        </Link>
      </div>
    </main>
  );
}
