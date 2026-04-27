"use client";

import type { ReactNode } from "react";
import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
};

type Position = {
  left: number;
  top: number;
};

export function Tooltip({ children, content }: TooltipProps) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ left: 0, top: 0 });

  useEffect(() => {
    if (!visible) {
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRef.current;
      const bubble = bubbleRef.current;

      if (!anchor || !bubble) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const preferredLeft = anchorRect.left + anchorRect.width / 2 - bubbleRect.width / 2;
      const clampedLeft = Math.max(12, Math.min(preferredLeft, viewportWidth - bubbleRect.width - 12));

      let top = anchorRect.top - bubbleRect.height - 10;

      if (top < 12) {
        top = Math.min(anchorRect.bottom + 10, viewportHeight - bubbleRect.height - 12);
      }

      setPosition({ left: clampedLeft, top });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible]);

  const child = isValidElement(children)
    ? cloneElement(children, {
        "aria-describedby": visible ? id : undefined
      } as Record<string, unknown>)
    : children;

  return (
    <span
      className="inline-flex"
      onBlur={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={anchorRef}
    >
      {child}
      <div
        aria-hidden={!visible}
        className={cn(
          "pointer-events-none fixed z-50 max-w-64 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--background-elevated)] px-3 py-2 text-xs leading-5 text-[var(--foreground)] shadow-[var(--shadow-md)] transition-all duration-[var(--transition-fast)]",
          visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        )}
        id={id}
        ref={bubbleRef}
        role="tooltip"
        style={{ left: position.left, top: position.top }}
      >
        {content}
      </div>
    </span>
  );
}
