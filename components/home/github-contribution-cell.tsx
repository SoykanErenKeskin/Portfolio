"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type GitHubContributionCellProps = {
  className: string;
  tooltip: string;
};

type TipPos = { top: number; left: number; place: "above" | "below" };

function prefersHover(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export function GitHubContributionCell({ className, tooltip }: GitHubContributionCellProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<TipPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
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

  const updatePos = useCallback(() => {
    const el = wrapRef.current;
    const tip = tipRef.current;
    if (!el || !tip) return;
    const r = el.getBoundingClientRect();
    const tipH = tip.offsetHeight;
    const tipW = tip.offsetWidth;
    const gap = 8;
    const spaceBelow = window.innerHeight - r.bottom;
    const place: "above" | "below" =
      spaceBelow < tipH + gap + 12 && r.top > tipH + gap ? "above" : "below";
    const top = place === "below" ? r.bottom + gap : r.top - gap;
    const half = tipW / 2;
    const left = Math.min(
      Math.max(r.left + r.width / 2, half + 8),
      window.innerWidth - half - 8
    );
    setPos({ top, left, place });
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => clearLeave();
  }, [clearLeave]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePos();
    const id = requestAnimationFrame(() => updatePos());
    const onMove = () => updatePos();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, updatePos, tooltip]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (wrapRef.current?.contains(t)) return;
      if (tipRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative flex min-h-0 min-w-0 items-center justify-center overflow-visible",
        open ? "z-30" : "z-0"
      )}
      onMouseEnter={() => {
        if (prefersHover()) show();
      }}
      onMouseLeave={() => {
        if (prefersHover()) hide();
      }}
    >
      <div
        tabIndex={0}
        aria-label={tooltip}
        onFocus={show}
        onBlur={() => {
          if (prefersHover()) hide();
        }}
        onClick={() => {
          if (prefersHover()) return;
          clearLeave();
          setOpen((v) => !v);
        }}
        className={cn(
          "aspect-square w-full min-h-0 cursor-default rounded-sm border border-border/40 outline-none",
          "transition-[transform,box-shadow,border-color] duration-200 ease-out",
          "md:hover:z-20 md:hover:scale-110 md:hover:border-emerald-500/45",
          "md:hover:shadow-[0_4px_14px_-2px_rgb(0_0_0_/_0.35),0_0_0_1px_rgb(16_185_129_/_0.25),0_0_20px_2px_rgb(52_211_153_/_0.28)]",
          "dark:md:hover:shadow-[0_4px_18px_-2px_rgb(0_0_0_/_0.55),0_0_0_1px_rgb(52_211_153_/_0.35),0_0_24px_4px_rgb(52_211_153_/_0.22)]",
          "focus-visible:z-20 focus-visible:scale-110 focus-visible:border-emerald-500/45 focus-visible:ring-2 focus-visible:ring-accent/45",
          "focus-visible:shadow-[0_4px_14px_-2px_rgb(0_0_0_/_0.35),0_0_18px_2px_rgb(52_211_153_/_0.25)]",
          open && "ring-2 ring-accent/35",
          className
        )}
      />
      {open && mounted
        ? createPortal(
            <div
              ref={tipRef}
              role="tooltip"
              className={cn(
                "pointer-events-none fixed z-[200] w-max max-w-[min(90vw,20rem)]",
                !pos && "invisible left-0 top-0"
              )}
              style={
                pos
                  ? {
                      top: pos.top,
                      left: pos.left,
                      transform:
                        pos.place === "above"
                          ? "translate(-50%, -100%)"
                          : "translate(-50%, 0)",
                    }
                  : undefined
              }
            >
              <div className="rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 font-mono text-[10px] leading-snug tracking-wide text-ink shadow-panel ring-1 ring-border/20">
                {tooltip}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
