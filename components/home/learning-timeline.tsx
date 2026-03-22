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
        <div className="flex min-w-max items-center">
          {years.map((year) => (
            <div key={year} className="flex items-center">
              {/* Year anchor: vertical lines above & below rotated text (270°) */}
              <div className="flex flex-col items-center gap-3 self-center">
                <div className="h-4 w-px flex-shrink-0 bg-border sm:h-5" aria-hidden />
                <span
                  className="inline-block origin-center font-mono text-sm font-medium uppercase tracking-[0.18em] text-ink"
                  style={{ transform: "rotate(270deg)" }}
                >
                  {year}
                </span>
                <div className="h-4 w-px flex-shrink-0 bg-border sm:h-5" aria-hidden />
              </div>

              {/* Milestone cards for this year */}
              <div className="flex flex-wrap gap-5 pl-4 pr-10 sm:pl-6 sm:pr-12">
                {(byYear[year] ?? []).map((item) => {
                  const toolName = item.toolEn;
                  const levelLabel = getLevelLabel(item.level, m.home.learningTimeline);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "panel-edge flex h-28 w-28 shrink-0 flex-col justify-center gap-2 border border-border bg-surface px-3 py-4 transition-colors hover:border-accent/50 hover:bg-accent/5"
                      )}
                    >
                      <span className="break-words font-mono text-[11px] font-medium text-ink">
                        {toolName}
                      </span>
                      <span
                        className={cn(
                          "mt-auto self-start rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
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
