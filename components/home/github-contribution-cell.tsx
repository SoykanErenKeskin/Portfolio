"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type GitHubContributionCellProps = {
  className: string;
  tooltip: string;
};

export function GitHubContributionCell({ className, tooltip }: GitHubContributionCellProps) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLeave = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearLeave();
    setOpen(true);
  }, [clearLeave]);

  const hide = useCallback(() => {
    clearLeave();
    leaveTimer.current = setTimeout(() => setOpen(false), 80);
  }, [clearLeave]);

  useEffect(() => () => clearLeave(), [clearLeave]);

  return (
    <div
      className="relative z-0 flex min-h-0 min-w-0 items-center justify-center overflow-visible"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <div
        tabIndex={0}
        aria-label={tooltip}
        onFocus={show}
        onBlur={hide}
        className={cn(
          "aspect-square w-full min-h-0 cursor-default rounded-sm border border-border/40 outline-none",
          "transition-[transform,box-shadow,border-color] duration-200 ease-out",
          "hover:z-20 hover:scale-110 hover:border-emerald-500/45",
          "hover:shadow-[0_4px_14px_-2px_rgb(0_0_0_/_0.35),0_0_0_1px_rgb(16_185_129_/_0.25),0_0_20px_2px_rgb(52_211_153_/_0.28)]",
          "dark:hover:shadow-[0_4px_18px_-2px_rgb(0_0_0_/_0.55),0_0_0_1px_rgb(52_211_153_/_0.35),0_0_24px_4px_rgb(52_211_153_/_0.22)]",
          "focus-visible:z-20 focus-visible:scale-110 focus-visible:border-emerald-500/45 focus-visible:ring-2 focus-visible:ring-accent/45",
          "focus-visible:shadow-[0_4px_14px_-2px_rgb(0_0_0_/_0.35),0_0_18px_2px_rgb(52_211_153_/_0.25)]",
          className
        )}
      />
      {open ? (
        <div
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-[min(100vw-2rem,20rem)] -translate-x-1/2"
          role="tooltip"
        >
          <div className="rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 font-mono text-[10px] leading-snug tracking-wide text-ink shadow-panel ring-1 ring-border/20">
            {tooltip}
          </div>
        </div>
      ) : null}
    </div>
  );
}
