import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8"
} as const;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  footer?: ReactNode;
  header?: ReactNode;
  hover?: boolean;
  padding?: keyof typeof paddingClasses;
};

export function Card({
  children,
  className,
  footer,
  header,
  hover = false,
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background-elevated)_92%,transparent)] shadow-[var(--shadow-md)] backdrop-blur-sm transition-all duration-[var(--transition-base)]",
        hover && "hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]",
        className
      )}
      {...props}
    >
      {header ? <div className="border-b border-[var(--border)] px-6 py-4">{header}</div> : null}
      <div className={cn(paddingClasses[padding], header && "pt-5", footer && "pb-5")}>{children}</div>
      {footer ? <div className="border-t border-[var(--border)] px-6 py-4">{footer}</div> : null}
    </div>
  );
}

