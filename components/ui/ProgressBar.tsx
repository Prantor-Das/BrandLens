import { cn } from "@/lib/cn";

type ProgressBarProps = {
  className?: string;
  label?: string;
  value: number;
};

function getTone(value: number) {
  if (value < 40) {
    return "var(--color-danger)";
  }

  if (value < 70) {
    return "var(--color-warning)";
  }

  return "var(--color-success)";
}

export function ProgressBar({ className, label = "Score", value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const tone = getTone(safeValue);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--foreground-muted)]">{label}</span>
        <span className="font-medium text-[var(--foreground)]">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]">
        <div
          aria-hidden="true"
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            background: `linear-gradient(to right, color-mix(in oklab, ${tone} 84%, white), ${tone})`,
            width: `${safeValue}%`
          }}
        />
      </div>
    </div>
  );
}

