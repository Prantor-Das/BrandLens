import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: string;
  helperText?: string;
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, helperText, id, label, leftIcon, rightIcon, ...props },
  ref
) {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--foreground)]">
          <span>{label}</span>
        </span>
      ) : null}
      <span
        className={cn(
          "relative flex h-12 items-center rounded-[var(--radius-md)] border bg-[color-mix(in_oklab,var(--background-elevated)_84%,transparent)] px-3.5 transition-all duration-[var(--transition-fast)]",
          error
            ? "border-[color-mix(in_oklab,var(--color-danger)_45%,transparent)] focus-within:border-[var(--color-danger)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklab,var(--color-danger)_22%,transparent)]"
            : "border-[var(--border)] focus-within:border-[color-mix(in_oklab,var(--color-brand)_40%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklab,var(--color-brand)_18%,transparent)]"
        )}
      >
        {leftIcon ? <span className="mr-2 text-[var(--foreground-subtle)]">{leftIcon}</span> : null}
        <input
          ref={ref}
          className={cn(
            "w-full border-0 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]",
            className
          )}
          id={id}
          {...props}
        />
        {rightIcon ? <span className="ml-2 text-[var(--foreground-subtle)]">{rightIcon}</span> : null}
      </span>
      {error ? (
        <span className="text-sm text-[var(--color-danger)]">{error}</span>
      ) : helperText ? (
        <span className="text-sm text-[var(--foreground-subtle)]">{helperText}</span>
      ) : null}
    </label>
  );
});

