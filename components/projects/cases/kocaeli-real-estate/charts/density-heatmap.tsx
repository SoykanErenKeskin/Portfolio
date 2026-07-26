"use client";

import { useId, useState } from "react";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { KocaeliDensity } from "@/lib/kocaeli-real-estate/snapshot-schema";
import { kocaeliCopy } from "@/content/cases/kocaeli-real-estate/copy";
import { cn } from "@/lib/utils";

type Props = {
  density: KocaeliDensity;
  locale: Locale;
  messages: Messages;
};

function cellValue(c: { count?: number; density?: number }): number {
  return c.density ?? c.count ?? 0;
}

export function DensityHeatmap({ density, locale, messages: m }: Props) {
  const gid = useId();
  const [hover, setHover] = useState<{
    i: number;
    j: number;
    value: number;
    count?: number;
    density?: number;
  } | null>(null);

  const nA = density.actualBinEdges.length - 1;
  const nP = density.predictedBinEdges.length - 1;
  const pad = { l: 52, r: 12, t: 12, b: 44 };
  const w = 360;
  const h = 360;
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const cw = iw / nA;
  const ch = ih / nP;

  const grid = new Map<string, { count?: number; density?: number }>();
  let maxV = 0;
  for (const cell of density.cells) {
    const key = `${cell.actualBinIndex},${cell.predictedBinIndex}`;
    grid.set(key, cell);
    maxV = Math.max(maxV, cellValue(cell));
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mx-auto h-auto max-h-[min(420px,70vw)] w-full max-w-md"
        role="img"
        aria-label={kocaeliCopy.densityTitle[locale]}
      >
        <title>{kocaeliCopy.densityTitle[locale]}</title>
        {Array.from({ length: nA }, (_, i) =>
          Array.from({ length: nP }, (_, j) => {
            const cell = grid.get(`${i},${j}`);
            const v = cell ? cellValue(cell) : 0;
            const t = maxV > 0 ? v / maxV : 0;
            const x = pad.l + i * cw;
            // predicted on Y: low at bottom
            const y = pad.t + (nP - 1 - j) * ch;
            const fill =
              v <= 0
                ? "rgb(var(--border-subtle) / 0.35)"
                : `rgb(var(--accent) / ${0.12 + t * 0.78})`;
            return (
              <rect
                key={`${i}-${j}`}
                x={x}
                y={y}
                width={cw - 0.5}
                height={ch - 0.5}
                fill={fill}
                stroke="rgb(var(--border) / 0.35)"
                strokeWidth={0.5}
                onMouseEnter={() =>
                  setHover({
                    i,
                    j,
                    value: v,
                    count: cell?.count,
                    density: cell?.density,
                  })
                }
                onMouseLeave={() => setHover(null)}
                onFocus={() =>
                  setHover({
                    i,
                    j,
                    value: v,
                    count: cell?.count,
                    density: cell?.density,
                  })
                }
                onBlur={() => setHover(null)}
                tabIndex={v > 0 ? 0 : -1}
                className="outline-none focus:stroke-accent"
              >
                <title>
                  {`${fmt(density.actualBinEdges[i]!)}–${fmt(density.actualBinEdges[i + 1]!)} × ${fmt(density.predictedBinEdges[j]!)}–${fmt(density.predictedBinEdges[j + 1]!)} · ${m.kocaeliCase.cellCount}: ${cell?.count ?? "—"} · ${m.kocaeliCase.cellDensity}: ${cell?.density ?? "—"}`}
                </title>
              </rect>
            );
          })
        )}
        {/* y = x reference */}
        <line
          x1={pad.l}
          y1={pad.t + ih}
          x2={pad.l + iw}
          y2={pad.t}
          stroke="rgb(var(--ink-faint))"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.85}
        >
          <title>{m.kocaeliCase.perfectPrediction}</title>
        </line>
        <text
          x={pad.l + iw / 2}
          y={h - 8}
          textAnchor="middle"
          className="fill-ink-faint"
          style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}
        >
          {kocaeliCopy.densityAxisActual[locale]}
        </text>
        <text
          x={14}
          y={pad.t + ih / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${pad.t + ih / 2})`}
          className="fill-ink-faint"
          style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}
        >
          {kocaeliCopy.densityAxisPredicted[locale]}
        </text>
        {/* legend */}
        <defs>
          <linearGradient id={`${gid}-leg`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgb(var(--accent) / 0.12)" />
            <stop offset="100%" stopColor="rgb(var(--accent) / 0.9)" />
          </linearGradient>
        </defs>
        <rect
          x={pad.l}
          y={4}
          width={48}
          height={6}
          fill={`url(#${gid}-leg)`}
          stroke="rgb(var(--border) / 0.5)"
          strokeWidth={0.5}
        />
      </svg>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {kocaeliCopy.densityLegend[locale]} · {m.kocaeliCase.unitPriceNote}
      </p>
      {hover ? (
        <p
          className={cn(
            "mt-1 font-mono text-[11px] text-ink-muted",
            "motion-safe:transition-opacity"
          )}
          aria-live="polite"
        >
          {fmt(density.actualBinEdges[hover.i]!)}–
          {fmt(density.actualBinEdges[hover.i + 1]!)} ×{" "}
          {fmt(density.predictedBinEdges[hover.j]!)}–
          {fmt(density.predictedBinEdges[hover.j + 1]!)} ·{" "}
          {m.kocaeliCase.cellCount}: {hover.count ?? "—"} ·{" "}
          {m.kocaeliCase.cellDensity}: {hover.density ?? "—"}
        </p>
      ) : null}
    </div>
  );
}

export function DensityEmptyState({
  locale,
  messages: m,
}: {
  locale: Locale;
  messages: Messages;
}) {
  return (
    <div
      className="panel-edge flex flex-col gap-2 bg-surface-raised px-4 py-8 text-center"
      role="status"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        {kocaeliCopy.densityEmptyTitle[locale]}
      </p>
      <p className="mx-auto max-w-md font-sans text-sm text-ink-muted">
        {kocaeliCopy.densityEmptyBody[locale]}
      </p>
      <p className="font-mono text-[10px] text-ink-faint">
        {m.kocaeliCase.densityEmpty}
      </p>
    </div>
  );
}
