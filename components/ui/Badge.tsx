import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  default:
    "border border-[var(--border)] bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] text-[var(--foreground)]",
  success:
    "border border-[color-mix(in_oklab,var(--color-success)_24%,transparent)] bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[var(--color-success)]",
  warning:
    "border border-[color-mix(in_oklab,var(--color-warning)_24%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]",
  danger:
    "border border-[color-mix(in_oklab,var(--color-danger)_24%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_14%,transparent)] text-[var(--color-danger)]",
  info:
    "border border-[color-mix(in_oklab,var(--color-brand)_24%,transparent)] bg-[color-mix(in_oklab,var(--color-brand)_14%,transparent)] text-[var(--color-brand)]",
  outline: "border border-[var(--border)] bg-transparent text-[var(--foreground-muted)]"
} as const;

const sizes = {
  sm: "h-6 px-2.5 text-[11px]",
  md: "h-7 px-3 text-xs"
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
};

export function Badge({ children, className, size = "md", variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-[0.01em]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

