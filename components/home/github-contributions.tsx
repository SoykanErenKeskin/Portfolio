import type { Messages } from "@/types/messages";
import type { GitHubContributionsData } from "@/lib/github/contributions";
import { GitHubContributionCell } from "@/components/home/github-contribution-cell";
import { cn } from "@/lib/utils";

type GitHubContributionsProps = {
  data: GitHubContributionsData;
  messages: Messages;
  locale: "en" | "tr";
  profileUrl: string;
};

function formatMonthLabel(date: Date, locale: "en" | "tr"): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
  }).format(date);
}

/** GitHub API `color` is light-theme biased; map by count for dark/light UI. */
function contributionCellClass(count: number): string {
  if (count === 0) {
    return "bg-border/80 dark:bg-[#161b22]";
  }
  if (count <= 3) {
    return "bg-emerald-600/30 dark:bg-[#0e4429]";
  }
  if (count <= 6) {
    return "bg-emerald-600/50 dark:bg-[#006d32]";
  }
  if (count <= 9) {
    return "bg-emerald-600/70 dark:bg-[#26a641]";
  }
  return "bg-emerald-500 dark:bg-[#39d353]";
}

/** contributionDays order: Sun(0) … Sat(6), matching GitHub API */
const WEEKDAY_ROW_LABELS: (string | null)[] = [null, "Mon", null, "Wed", null, "Fri", null];

function formatCellTooltip(
  dateStr: string,
  count: number,
  locale: "en" | "tr",
  template: string
): string {
  const d = new Date(dateStr + "T12:00:00");
  const dateLabel = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
  return template.replace("{date}", dateLabel).replace("{count}", String(count));
}

function buildWeekMeta(weeks: GitHubContributionsData["weeks"], locale: "en" | "tr") {
  let prevMonth = -1;
  return weeks.map((week) => {
    const first = week.contributionDays[0];
    const d = first ? new Date(first.date + "T12:00:00") : new Date();
    const m = d.getMonth();
    const showMonth = m !== prevMonth;
    prevMonth = m;
    return {
      week,
      showMonth,
      monthLabel: showMonth ? formatMonthLabel(d, locale) : "",
    };
  });
}

export function GitHubContributions({ data, messages: m, locale, profileUrl }: GitHubContributionsProps) {
  const ga = m.home.githubActivity;
  const weekMeta = buildWeekMeta(data.weeks, locale);

  return (
    <div className="mt-12 border-t border-border pt-10">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
            {ga.title}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {ga.subtitle}
          </p>
        </div>
        <div className="hidden font-mono text-[10px] text-ink-faint md:block">{ga.figure}</div>
      </div>

      <p className="mb-4 font-mono text-[11px] text-ink-muted">
        {ga.totalContributions.replace(
          "{count}",
          String(data.totalContributions)
        )}
      </p>

      <div className="w-full min-w-0 overflow-visible pb-2">
        <div
          className="grid w-full gap-x-1.5 gap-y-1.5 overflow-visible"
          style={{
            gridTemplateColumns: `2rem repeat(${weekMeta.length}, minmax(0, 1fr))`,
            gridTemplateRows: "auto repeat(7, auto)",
          }}
        >
          <div className="min-h-4" aria-hidden />

          {weekMeta.map(({ showMonth, monthLabel }, wi) => (
            <div
              key={`m-${wi}`}
              className="flex min-w-0 items-end justify-center pb-0.5"
            >
              <span
                className={cn(
                  "truncate text-center font-mono text-[9px] leading-none text-ink-faint",
                  !showMonth && "opacity-0"
                )}
              >
                {showMonth ? monthLabel : "·"}
              </span>
            </div>
          ))}

          {Array.from({ length: 7 }, (_, dayIdx) => (
            <div key={`row-${dayIdx}`} className="contents">
              <div className="flex items-center justify-end pr-1 font-mono text-[9px] text-ink-faint">
                {WEEKDAY_ROW_LABELS[dayIdx] ?? (
                  <span className="select-none text-transparent">·</span>
                )}
              </div>
              {weekMeta.map(({ week }, wi) => {
                const day = week.contributionDays[dayIdx];
                if (!day) return <div key={`${wi}-${dayIdx}`} />;
                const tooltip = formatCellTooltip(
                  day.date,
                  day.contributionCount,
                  locale,
                  ga.cellTooltip
                );
                return (
                  <GitHubContributionCell
                    key={day.date}
                    className={cn(contributionCellClass(day.contributionCount))}
                    tooltip={tooltip}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex w-full flex-wrap items-center justify-end gap-2 font-mono text-[9px] text-ink-faint">
          <span>{ga.less}</span>
          <span className="inline-flex gap-1.5">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-sm border border-border/40 sm:h-3 sm:w-3",
                contributionCellClass(0)
              )}
            />
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-sm border border-border/40 sm:h-3 sm:w-3",
                contributionCellClass(2)
              )}
            />
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-sm border border-border/40 sm:h-3 sm:w-3",
                contributionCellClass(5)
              )}
            />
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-sm border border-border/40 sm:h-3 sm:w-3",
                contributionCellClass(8)
              )}
            />
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-sm border border-border/40 sm:h-3 sm:w-3",
                contributionCellClass(12)
              )}
            />
          </span>
          <span>{ga.more}</span>
        </div>
      </div>

      <p className="mt-4">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:underline"
        >
          {ga.viewProfile} →
        </a>
      </p>
    </div>
  );
}
