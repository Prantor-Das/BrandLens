import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-[3px]"
} as const;

type SpinnerProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block rounded-full border-solid border-current border-r-transparent align-[-0.125em] text-[var(--color-brand)] [animation:spin_0.8s_linear_infinite]",
        sizeClasses[size],
        className
      )}
    />
  );
}

