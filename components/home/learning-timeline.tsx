import type { Messages } from "@/types/messages";
import type { LearningEntry } from "@/lib/db/learning-timeline";
import { cn } from "@/lib/utils";

type LearningTimelineProps = {
  messages: Messages;
  items: LearningEntry[];
  locale: "en" | "tr";
};

function getLevelLabel(
  level: LearningEntry["level"],
  m: Messages["home"]["learningTimeline"]
): string {
  switch (level) {
    case "basic":
      return m.levelBasic;
    case "intermediate":
      return m.levelIntermediate;
    case "advanced":
      return m.levelAdvanced;
    default:
      return m.levelIntermediate;
  }
}

export function LearningTimeline({ messages: m, items, locale }: LearningTimelineProps) {
  if (items.length === 0) return null;

  const byYear = items.reduce<Record<number, LearningEntry[]>>((acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  }, {});

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="mt-12 border-t border-border pt-10">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
            {m.home.learningTimeline.title}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {m.home.learningTimeline.subtitle}
          </p>
        </div>
        <div className="hidden font-mono text-[10px] text-ink-faint md:block">
          {m.home.learningTimeline.figure}
        </div>
      </div>

      <div className="chat-scroll-themed flex min-w-0 overflow-x-auto pb-4">
        {/* Horizontal timeline track */}
        <div className="flex min-w-max items-stretch gap-0">
          {years.map((year) => (
            <div key={year} className="flex min-w-[320px] items-stretch sm:min-w-[380px]">
              {/* Year anchor: vertical lines above & below rotated text (270°) */}
              <div className="flex flex-col items-center gap-4 self-stretch pt-2 pb-2">
                <div className="h-4 w-px flex-shrink-0 bg-border sm:h-5" aria-hidden />
                <span
                  className="inline-block origin-center font-mono text-sm font-medium uppercase tracking-[0.18em] text-ink"
                  style={{ transform: "rotate(270deg)" }}
                >
                  {year}
                </span>
                <div className="h-4 w-px flex-shrink-0 bg-border sm:h-5" aria-hidden />
              </div>

              {/* Milestone cards: single horizontal row */}
              <div className="flex flex-nowrap gap-3 pl-5 pr-8 sm:pl-6 sm:pr-10">
                {(byYear[year] ?? []).map((item) => {
                  const toolName =
                    locale === "tr" && item.toolTr
                      ? item.toolTr
                      : item.toolEn;
                  const levelLabel = getLevelLabel(item.level, m.home.learningTimeline);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative flex w-[180px] min-h-[7rem] shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-surface px-4 py-4 shadow-sm transition-all duration-200 hover:border-accent/40 hover:shadow-md hover:shadow-accent/5",
                        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgb(var(--accent)_/_0.04),transparent_50%)] before:opacity-0 before:transition-opacity before:duration-200 group-hover:before:opacity-100",
                        item.level === "advanced" && "border-l-2 border-l-emerald-500/50",
                        item.level === "intermediate" && "border-l-2 border-l-amber-500/50",
                        item.level === "basic" && "border-l-2 border-l-slate-500/40"
                      )}
                    >
                      <span className="relative min-w-0 break-words font-mono text-[12px] font-medium leading-snug text-ink">
                        {toolName}
                      </span>
                      <span
                        className={cn(
                          "relative mt-2 w-fit self-start rounded-md px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                          item.level === "advanced" &&
                            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                          item.level === "intermediate" &&
                            "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                          item.level === "basic" &&
                            "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {levelLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
