import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-3xl items-center px-6 py-12 md:px-8">
      <Card className="w-full" padding="lg">
        <div className="space-y-5">
          <Badge size="sm" variant="outline">
            404
          </Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.035em] text-[var(--foreground)]">That page slipped out of view.</h1>
            <p className="text-base leading-7 text-[var(--foreground-muted)]">
              The route you were looking for does not exist or has already moved.
            </p>
          </div>
          <Link
            className="inline-flex text-sm font-medium text-[var(--foreground-muted)] transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
            href="/"
          >
            Go back
          </Link>
        </div>
      </Card>
    </main>
  );
}
