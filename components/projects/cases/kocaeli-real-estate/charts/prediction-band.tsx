import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import { kocaeliCopy } from "@/content/cases/kocaeli-real-estate/copy";

/** Illustrative total dwelling value (not unit price TL/m²). */
const ILLUSTRATIVE = {
  estimate: 7_200_000,
  reasonableMin: 6_500_000,
  reasonableMax: 8_000_000,
  widerMin: 6_100_000,
  widerMax: 8_400_000,
};

function formatTl(n: number, locale: Locale): string {
  const millions = n / 1_000_000;
  const formatted = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(millions);
  return `${formatted}M TL`;
}

export function PredictionBandFigure({
  locale,
  messages: m,
}: {
  locale: Locale;
  messages: Messages;
}) {
  const min = ILLUSTRATIVE.widerMin;
  const max = ILLUSTRATIVE.widerMax;
  const span = max - min;
  const toPct = (v: number) => ((v - min) / span) * 100;

  return (
    <div className="panel-edge space-y-4 bg-surface-raised p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
        {m.kocaeliCase.illustrativeTotalValue}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {kocaeliCopy.productBandIllustrative[locale]}
      </p>
      <dl className="space-y-2 font-sans text-sm text-ink-muted">
        <div className="flex flex-wrap justify-between gap-2">
          <dt>{kocaeliCopy.productBandLabels.estimate[locale]}</dt>
          <dd className="font-mono text-ink">
            {formatTl(ILLUSTRATIVE.estimate, locale)}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt>{kocaeliCopy.productBandLabels.reasonable[locale]}</dt>
          <dd className="font-mono text-ink">
            {formatTl(ILLUSTRATIVE.reasonableMin, locale)}{" "}
            {kocaeliCopy.productBandLabels.rangeTo[locale]}{" "}
            {formatTl(ILLUSTRATIVE.reasonableMax, locale)}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt>{kocaeliCopy.productBandLabels.wider[locale]}</dt>
          <dd className="font-mono text-ink">
            {formatTl(ILLUSTRATIVE.widerMin, locale)}{" "}
            {kocaeliCopy.productBandLabels.rangeTo[locale]}{" "}
            {formatTl(ILLUSTRATIVE.widerMax, locale)}
          </dd>
        </div>
      </dl>
      <div
        className="relative mt-2 h-3 w-full max-w-md border border-border bg-border-subtle/40"
        role="img"
        aria-label={kocaeliCopy.productBandFigure[locale]}
      >
        <div
          className="absolute inset-y-0 bg-ink-faint/25"
          style={{
            left: `${toPct(ILLUSTRATIVE.widerMin)}%`,
            width: `${toPct(ILLUSTRATIVE.widerMax) - toPct(ILLUSTRATIVE.widerMin)}%`,
          }}
        />
        <div
          className="absolute inset-y-0 bg-accent/45"
          style={{
            left: `${toPct(ILLUSTRATIVE.reasonableMin)}%`,
            width: `${toPct(ILLUSTRATIVE.reasonableMax) - toPct(ILLUSTRATIVE.reasonableMin)}%`,
          }}
        />
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-ink"
          style={{ left: `${toPct(ILLUSTRATIVE.estimate)}%` }}
        />
      </div>
    </div>
  );
}
