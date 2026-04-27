"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-3xl items-center px-6 py-12 md:px-8">
      <Card className="w-full" padding="lg">
        <div className="space-y-5">
          <Badge size="sm" variant="danger">
            Something went wrong
          </Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.035em] text-[var(--foreground)]">
              We hit an unexpected error.
            </h1>
            <p className="text-base leading-7 text-[var(--foreground-muted)]">
              Try the action again, or head back to restart the analysis flow.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={reset} variant="primary">
              Try again
            </Button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition-all duration-[var(--transition-fast)] hover:border-[var(--border-strong)] hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]"
              href="/"
            >
              Go back
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
}
