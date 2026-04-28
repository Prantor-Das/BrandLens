"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { animationClasses } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const variants = {
  primary:
    "bg-[var(--color-brand)] text-white shadow-[0_10px_30px_color-mix(in_oklab,var(--color-brand)_26%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-brand)_88%,black)]",
  secondary:
    "border border-[var(--border)] bg-[var(--background-elevated)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[color-mix(in_oklab,var(--background-elevated)_92%,white)]",
  ghost:
    "text-[var(--foreground-muted)] hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:text-[var(--foreground)]",
  danger:
    "bg-[var(--color-danger)] text-white shadow-[0_10px_30px_color-mix(in_oklab,var(--color-danger)_24%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-danger)_84%,black)]"
} as const;

const sizes = {
  sm: "h-9 gap-2 px-3.5 text-sm",
  md: "h-11 gap-2 px-4 text-sm",
  lg: "h-[3.25rem] gap-2.5 px-5 text-base"
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leftIcon?: ReactNode;
  loading?: boolean;
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
};

export function Button({
  children,
  className,
  disabled,
  leftIcon,
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium whitespace-nowrap transition-all duration-[var(--transition-fast)] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50",
        animationClasses.interactiveButton,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? <Spinner className="text-current" size={size === "lg" ? "md" : "sm"} /> : leftIcon}
      <span>{children}</span>
    </button>
  );
}
