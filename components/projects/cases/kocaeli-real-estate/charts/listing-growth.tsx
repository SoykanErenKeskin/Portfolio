"use client";

/**
 * Listing growth SVG charts for the Kocaeli case page.
 * Data comes from snapshot.listingGrowth (dashboard → Storage). No Neon on the site.
 */

import { useCallback, useId, useState, type MouseEvent } from "react";
import type { Locale } from "@/types/locale";
import type { KocaeliListingGrowth } from "@/lib/kocaeli-real-estate/snapshot-schema";
import { kocaeliCopy } from "@/content/cases/kocaeli-real-estate/copy";

const MAX_CUMULATIVE_POINTS = 120;

function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  const out: T[] = [];
  for (let i = 0; i < arr.length; i += step) {
    out.push(arr[i]!);
  }
  const last = arr[arr.length - 1]!;
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

type Pt = { x: number; y: number };

/** Catmull-Rom → cubic Bezier smooth path (open curve). */
function smoothPath(points: Pt[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M${points[0]!.x},${points[0]!.y}`;
  }
  if (points.length === 2) {
    return `M${points[0]!.x},${points[0]!.y} L${points[1]!.x},${points[1]!.y}`;
  }

  let d = `M${points[0]!.x.toFixed(2)},${points[0]!.y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

function toPoints(
  values: number[],
  x0: number,
  y0: number,
  w: number,
  h: number,
  yMax: number
): Pt[] {
  const n = values.length;
  if (n === 0 || yMax <= 0) return [];
  return values.map((v, i) => ({
    x: n === 1 ? x0 + w / 2 : x0 + (i / (n - 1)) * w,
    y: y0 + h - (v / yMax) * h,
  }));
}

function formatShortDate(date: string, locale: Locale): string {
  const d = new Date(date + "T12:00:00");
  if (!Number.isFinite(d.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(d);
}

function formatInt(n: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);
}

type SeriesKey = "sale" | "rental" | "total";

/** Order in tooltip matches reference: total, rental, sale */
const TOOLTIP_ORDER: SeriesKey[] = ["total", "rental", "sale"];

const SERIES_STYLE: Record<SeriesKey, { stroke: string }> = {
  sale: { stroke: "rgb(var(--accent))" },
  rental: { stroke: "#7CB342" },
  total: { stroke: "#EA3C62" },
};

function tickAnchor(
  i: number,
  lastIdx: number
): "start" | "middle" | "end" {
  if (i === 0) return "start";
  if (i === lastIdx) return "end";
  return "middle";
}

function MultiLineChart({
  dates,
  series,
  locale,
  ariaLabel,
}: {
  dates: string[];
  series: { key: SeriesKey; values: number[] }[];
  locale: Locale;
  ariaLabel: string;
}) {
  const gid = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const pad = { l: 36, r: 44, t: 12, b: 32 };
  const w = 480;
  const h = 200;
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const yMax = Math.max(1, ...series.flatMap((s) => s.values));
  const lastIdx = Math.max(0, dates.length - 1);

  const tickIdx =
    dates.length <= 4
      ? dates.map((_, i) => i)
      : [0, Math.floor(lastIdx / 2), lastIdx];

  const seriesByKey = Object.fromEntries(
    series.map((s) => [s.key, s.values])
  ) as Record<SeriesKey, number[]>;

  const onMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (dates.length === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const xSvg = ((e.clientX - rect.left) / rect.width) * w;
      const t = (xSvg - pad.l) / iw;
      const idx = Math.round(Math.min(1, Math.max(0, t)) * lastIdx);
      setHoverIdx(idx);
    },
    [dates.length, iw, lastIdx, pad.l, w]
  );

  const hoverX =
    hoverIdx == null || dates.length === 0
      ? null
      : dates.length === 1
        ? pad.l + iw / 2
        : pad.l + (hoverIdx / lastIdx) * iw;

  const tooltipLeftPct =
    hoverX == null ? 0 : Math.min(78, Math.max(8, (hoverX / w) * 100));

  return (
    <div className="relative w-full min-w-0">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full cursor-crosshair"
        role="img"
        aria-label={ariaLabel}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* subtle horizontal guides */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad.l}
            y1={pad.t + ih * (1 - f)}
            x2={pad.l + iw}
            y2={pad.t + ih * (1 - f)}
            stroke="rgb(var(--border))"
            strokeWidth={0.75}
            strokeDasharray="3 4"
            opacity={0.55}
          />
        ))}
        <line
          x1={pad.l}
          y1={pad.t + ih}
          x2={pad.l + iw}
          y2={pad.t + ih}
          stroke="rgb(var(--border))"
          strokeWidth={1}
        />
        <line
          x1={pad.l}
          y1={pad.t}
          x2={pad.l}
          y2={pad.t + ih}
          stroke="rgb(var(--border))"
          strokeWidth={1}
        />

        {series.map((s) => {
          const pts = toPoints(s.values, pad.l, pad.t, iw, ih, yMax);
          const d = smoothPath(pts);
          if (!d) return null;
          return (
            <path
              key={s.key}
              d={d}
              fill="none"
              stroke={SERIES_STYLE[s.key].stroke}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}

        {hoverX != null && hoverIdx != null ? (
          <g>
            <line
              x1={hoverX}
              y1={pad.t}
              x2={hoverX}
              y2={pad.t + ih}
              stroke="rgb(var(--ink))"
              strokeWidth={1}
              opacity={0.55}
            />
            {TOOLTIP_ORDER.map((key) => {
              const values = seriesByKey[key];
              if (!values) return null;
              const pts = toPoints(values, pad.l, pad.t, iw, ih, yMax);
              const p = pts[hoverIdx];
              if (!p) return null;
              return (
                <g key={key}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={SERIES_STYLE[key].stroke}
                    stroke="rgb(var(--surface-raised))"
                    strokeWidth={2}
                  />
                </g>
              );
            })}
          </g>
        ) : null}

        {tickIdx.map((i) => {
          const x =
            dates.length === 1
              ? pad.l + iw / 2
              : pad.l + (i / lastIdx) * iw;
          return (
            <text
              key={i}
              x={x}
              y={h - 10}
              textAnchor={tickAnchor(i, lastIdx)}
              className="fill-ink-faint"
              style={{ fontSize: 8, fontFamily: "ui-monospace, monospace" }}
            >
              {formatShortDate(dates[i]!, locale)}
            </text>
          );
        })}
        <text
          x={8}
          y={pad.t + 4}
          className="fill-ink-faint"
          style={{ fontSize: 8, fontFamily: "ui-monospace, monospace" }}
        >
          {yMax}
        </text>
      </svg>

      {hoverIdx != null && dates[hoverIdx] ? (
        <div
          id={`${gid}-tip`}
          className="pointer-events-none absolute z-10 min-w-[9.5rem] rounded border border-border bg-surface-raised px-3 py-2 shadow-sm"
          style={{
            left: `${tooltipLeftPct}%`,
            top: "8%",
            transform: "translateX(-50%)",
          }}
          role="status"
        >
          <p className="mb-1.5 font-mono text-[11px] font-medium text-ink">
            {dates[hoverIdx]}
          </p>
          <ul className="space-y-1">
            {TOOLTIP_ORDER.map((key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-4 font-mono text-[10px] text-ink-muted"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: SERIES_STYLE[key].stroke }}
                    aria-hidden
                  />
                  {kocaeliCopy.growthLegend[key][locale]}
                </span>
                <span className="text-ink">
                  {formatInt(seriesByKey[key]?.[hoverIdx] ?? 0, locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {TOOLTIP_ORDER.map((key) => (
          <span key={key} className="inline-flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: SERIES_STYLE[key].stroke }}
              aria-hidden
            />
            {kocaeliCopy.growthLegend[key][locale]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ListingGrowthCharts({
  growth,
  locale,
}: {
  growth: KocaeliListingGrowth;
  locale: Locale;
}) {
  const last30 = growth.last30Days;
  const cumulative = downsample(growth.allTimeCumulative, MAX_CUMULATIVE_POINTS);

  const has30 = last30.length > 0;
  const hasCum = cumulative.length > 0;

  if (!has30 && !hasCum) {
    return (
      <div className="panel-edge bg-surface-raised px-4 py-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          {kocaeliCopy.growthEmptyTitle[locale]}
        </p>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          {kocaeliCopy.growthEmptyBody[locale]}
        </p>
      </div>
    );
  }

  const metaParts = [
    growth.scope,
    growth.timezone,
    growth.basis,
    growth.firstListingDate && growth.lastListingDate
      ? `${growth.firstListingDate} to ${growth.lastListingDate}`
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] tracking-[0.14em] text-ink-faint">
        {metaParts.join(" · ")}
      </p>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
        {has30 ? (
          <div className="min-w-0">
            <h3 className="mb-1 font-mono text-[11px] text-ink">
              {kocaeliCopy.growth30Title[locale]}
            </h3>
            <p className="mb-3 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
              {kocaeliCopy.growth30Figure[locale]}
            </p>
            <MultiLineChart
              locale={locale}
              ariaLabel={kocaeliCopy.growth30Title[locale]}
              dates={last30.map((p) => p.date)}
              series={[
                { key: "sale", values: last30.map((p) => p.sale) },
                { key: "rental", values: last30.map((p) => p.rental) },
                { key: "total", values: last30.map((p) => p.total) },
              ]}
            />
          </div>
        ) : null}

        {hasCum ? (
          <div className="min-w-0">
            <h3 className="mb-1 font-mono text-[11px] text-ink">
              {kocaeliCopy.growthCumulativeTitle[locale]}
            </h3>
            <p className="mb-3 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
              {kocaeliCopy.growthCumulativeFigure[locale]}
            </p>
            <MultiLineChart
              locale={locale}
              ariaLabel={kocaeliCopy.growthCumulativeTitle[locale]}
              dates={cumulative.map((p) => p.date)}
              series={[
                {
                  key: "sale",
                  values: cumulative.map((p) => p.saleCumulative),
                },
                {
                  key: "rental",
                  values: cumulative.map((p) => p.rentalCumulative),
                },
                {
                  key: "total",
                  values: cumulative.map((p) => p.totalCumulative),
                },
              ]}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
