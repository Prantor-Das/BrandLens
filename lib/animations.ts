import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

export const animationClasses = {
  fadeInUp: "animate-fade-in-up",
  slideInRight: "animate-slide-in-right",
  shimmer: "animate-shimmer",
  interactiveButton:
    "transition-transform duration-[120ms] ease-out active:scale-[0.97] disabled:scale-100",
  interactiveCard:
    "transition-[border-color,transform,box-shadow] duration-[150ms] ease-out",
  interactiveInput:
    "transition-[border-color,box-shadow,background-color] duration-[150ms] ease-out",
  scoreBarFill: "animate-score-fill",
  staggerContainer: "stagger-children"
} as const;

export function getStaggerStyle(index: number, stepMs = 80) {
  return {
    "--stagger-index": index,
    animationDelay: `${index * stepMs}ms`
  } as CSSProperties;
}

export function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [duration, target]);

  return value;
}
