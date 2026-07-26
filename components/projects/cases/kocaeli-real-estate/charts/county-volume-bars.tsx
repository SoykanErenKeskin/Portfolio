import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { KocaeliSnapshot } from "@/lib/kocaeli-real-estate/snapshot-schema";
import {
  resolveCountyChartMode,
} from "@/lib/kocaeli-real-estate/snapshot-schema";
import { kocaeliCopy } from "@/content/cases/kocaeli-real-estate/copy";

type Props = {
  snapshot: KocaeliSnapshot;
  locale: Locale;
  messages: Messages;
};

export function CountyVolumeBars({ snapshot, locale, messages: m }: Props) {
  const mode = resolveCountyChartMode(snapshot);
  const counties = snapshot.dataset.counties;
  const max = Math.max(...counties.flatMap((c) => [c.sale, c.rental]), 1);
  const barH = 28;
  const gap = 14;
  const labelW = 88;
  const chartW = 280;
  const h = counties.length * (barH + gap) + 8;
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US").format(n);

  const note =
    mode.mode === "explained"
      ? mode.note[locale]
      : mode.mode === "approximate"
        ? mode.note?.[locale] ?? m.kocaeliCase.approximateDistribution
        : null;

  return (
    <div className="space-y-3">
      {(mode.mode === "approximate" || mode.mode === "explained") && (
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {m.kocaeliCase.approximateDistribution}
        </p>
      )}
      {note ? (
        <p className="font-sans text-[13px] leading-relaxed text-ink-muted">
          {note}
        </p>
      ) : null}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${labelW + chartW + 8} ${h}`}
          className="h-auto w-full min-w-[280px] max-w-lg"
          role="img"
          aria-label={kocaeliCopy.datasetTitle[locale]}
        >
          {counties.map((c, idx) => {
            const y = idx * (barH + gap);
            const saleW = (c.sale / max) * chartW;
            const rentW = (c.rental / max) * chartW;
            return (
              <g key={c.county}>
                <text
                  x={labelW - 8}
                  y={y + barH / 2 + 3}
                  textAnchor="end"
                  className="fill-ink-muted"
                  style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}
                >
                  {c.county}
                </text>
                <rect
                  x={labelW}
                  y={y + 2}
                  width={Math.max(saleW, 0)}
                  height={10}
                  fill="rgb(var(--accent) / 0.75)"
                />
                <rect
                  x={labelW}
                  y={y + 14}
                  width={Math.max(rentW, 0)}
                  height={10}
                  fill="rgb(var(--ink-faint) / 0.55)"
                  stroke="rgb(var(--border))"
                  strokeWidth={0.75}
                  strokeDasharray="2 1.5"
                />
                <text
                  x={labelW + saleW + 4}
                  y={y + 10}
                  className="fill-ink-faint"
                  style={{ fontSize: 8, fontFamily: "ui-monospace, monospace" }}
                >
                  {fmt(c.sale)}
                </text>
                <text
                  x={labelW + rentW + 4}
                  y={y + 22}
                  className="fill-ink-faint"
                  style={{ fontSize: 8, fontFamily: "ui-monospace, monospace" }}
                >
                  {fmt(c.rental)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2 w-4 bg-accent/75"
            aria-hidden
          />
          {m.kocaeliCase.sale}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2 w-4 border border-border bg-ink-faint/40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 2px, rgb(var(--border)) 2px, rgb(var(--border)) 3px)",
            }}
            aria-hidden
          />
          {m.kocaeliCase.rental}
        </span>
      </div>
    </div>
  );
}
