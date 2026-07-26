import type { Locale } from "@/types/locale";
import {
  kocaeliCopy,
  kocaeliTimeline,
  type TimelineDecision,
} from "@/content/cases/kocaeli-real-estate/copy";

function decisionLabel(d: TimelineDecision, locale: Locale): string {
  switch (d) {
    case "selected":
      return kocaeliCopy.decisionSelected[locale];
    case "rejected":
      return kocaeliCopy.decisionRejected[locale];
    case "diagnostic":
      return kocaeliCopy.decisionDiagnostic[locale];
    case "current-best":
      return kocaeliCopy.decisionCurrentBest[locale];
  }
}

export function ExperimentTimeline({ locale }: { locale: Locale }) {
  return (
    <ol className="relative space-y-0 border-l border-border pl-0">
      {kocaeliTimeline.map((item, i) => (
        <li key={i} className="relative border-b border-border-subtle py-4 pl-6 last:border-b-0">
          <span
            aria-hidden
            className="absolute left-[-5px] top-5 h-2 w-2 rounded-full border border-border bg-surface-raised"
          />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-mono text-[11px] font-medium text-ink">
              {item.era[locale]}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              [{decisionLabel(item.decision, locale)}]
            </span>
          </div>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
            {item.summary[locale]}
          </p>
        </li>
      ))}
    </ol>
  );
}
