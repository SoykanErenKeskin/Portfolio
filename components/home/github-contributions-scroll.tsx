"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type GitHubContributionsScrollProps = {
  className?: string;
  /** Bumps when heatmap dimensions/data change so we re-align to the end */
  alignKey: string;
  children: React.ReactNode;
};

/**
 * Horizontal scroll stays native; on narrow viewports we snap the initial
 * position to the right (most recent weeks) without relying on flex hacks.
 */
export function GitHubContributionsScroll({
  className,
  alignKey,
  children,
}: GitHubContributionsScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollToEndIfOverflow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    };
    apply();
    requestAnimationFrame(apply);
  }, []);

  useLayoutEffect(() => {
    scrollToEndIfOverflow();
  }, [alignKey, scrollToEndIfOverflow]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => scrollToEndIfOverflow());
    ro.observe(el);
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", scrollToEndIfOverflow);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", scrollToEndIfOverflow);
    };
  }, [scrollToEndIfOverflow]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
