import type { Messages } from "@/types/messages";
import type { GitHubContributionsData } from "@/lib/github/contributions";
import { GitHubContributionCell } from "@/components/home/github-contribution-cell";
import { GitHubContributionsScroll } from "@/components/home/github-contributions-scroll";
import { cn } from "@/lib/utils";

type GitHubContributionsProps = {
  data: GitHubContributionsData;
  messages: Messages;
  locale: "en" | "tr";
  profileUrl: string;
};

function formatMonthLabel(date: Date, locale: "en" | "tr"): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    month: "long",
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
    month: "long",
    year: "numeric",
  }).format(d);
  return template.replace("{date}", dateLabel).replace("{count}", String(count));
}

function weekStartMonth(week: GitHubContributionsData["weeks"][number]): number {
  const first = week.contributionDays[0];
  const d = first ? new Date(first.date + "T12:00:00") : new Date();
  return d.getMonth();
}

/** One merged header cell per calendar month (weeks are Sun-start, same as GitHub). */
function buildMonthHeaderSegments(
  weeks: GitHubContributionsData["weeks"],
  locale: "en" | "tr"
): { start: number; span: number; label: string }[] {
  const segments: { start: number; span: number; label: string }[] = [];
  let i = 0;
  while (i < weeks.length) {
    const month = weekStartMonth(weeks[i]!);
    const first = weeks[i]!.contributionDays[0];
    const d = first ? new Date(first.date + "T12:00:00") : new Date();
    let span = 1;
    for (let j = i + 1; j < weeks.length; j++) {
      if (weekStartMonth(weeks[j]!) !== month) break;
      span++;
    }
    segments.push({ start: i, span, label: formatMonthLabel(d, locale) });
    i += span;
  }
  return segments;
}

function buildWeekMeta(weeks: GitHubContributionsData["weeks"]) {
  return weeks.map((week) => ({ week }));
}

export function GitHubContributions({ data, messages: m, locale, profileUrl }: GitHubContributionsProps) {
  const ga = m.home.githubActivity;
  const weekMeta = buildWeekMeta(data.weeks);
  const monthSegments = buildMonthHeaderSegments(data.weeks, locale);
  const weekCount = weekMeta.length;
  /** Min width so week columns stay tappable/readable; parent scrolls on narrow viewports */
  const labelColPx = 40;
  const cellMinPx = 11;
  const gapPx = 6;
  const heatmapMinWidth = labelColPx + weekCount * cellMinPx + Math.max(0, weekCount - 1) * gapPx;

  return (
    <div className="mt-12 border-t border-border pt-10">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
            {ga.title}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {ga.subtitle}
          </p>
        </div>
        <div className="shrink-0 font-mono text-[9px] text-ink-faint md:text-[10px]">{ga.figure}</div>
      </div>

      <p className="mb-3 font-mono text-[11px] text-ink-muted md:mb-4">
        {ga.totalContributions.replace(
          "{count}",
          String(data.totalContributions)
        )}
      </p>

      <div className="relative -mx-4 md:mx-0">
        <GitHubContributionsScroll
          alignKey={`${weekCount}-${heatmapMinWidth}-${data.totalContributions}`}
          className={cn(
            "overflow-x-auto overflow-y-visible overscroll-x-contain px-4 pb-2",
            "md:overflow-visible md:px-0",
            "[-webkit-overflow-scrolling:touch]"
          )}
        >
          <div
            className="w-full min-w-[var(--gh-heatmap-min)] md:min-w-0"
            style={{ ["--gh-heatmap-min" as string]: `${heatmapMinWidth}px` }}
          >
            <div
              className="grid w-full gap-x-1.5 gap-y-1.5 overflow-visible md:gap-x-1.5"
              style={{
                gridTemplateColumns: `2.5rem repeat(${weekCount}, minmax(${cellMinPx}px, 1fr))`,
                gridTemplateRows: "auto repeat(7, auto)",
              }}
            >
              <div className="row-start-1 min-h-8 md:min-h-5" aria-hidden />

              {monthSegments.map((seg) => (
                <div
                  key={`month-${seg.start}`}
                  className="row-start-1 flex min-w-0 items-end justify-center px-0.5 pb-1 md:pb-0.5"
                  style={{ gridColumn: `${seg.start + 2} / span ${seg.span}` }}
                >
                  <span className="text-balance text-center font-mono text-[10px] leading-tight text-ink-faint md:text-[11px]">
                    {seg.label}
                  </span>
                </div>
              ))}

              {Array.from({ length: 7 }, (_, dayIdx) => (
                <div key={`row-${dayIdx}`} className="contents">
                  <div className="flex items-center justify-end pr-1 font-mono text-[10px] text-ink-faint tabular-nums md:text-[9px]">
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
          </div>
        </GitHubContributionsScroll>

        <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2 px-4 font-mono text-[10px] text-ink-faint md:justify-end md:px-0 md:text-[9px]">
          <span>{ga.less}</span>
          <span className="inline-flex items-center gap-2 md:gap-1.5">
            <span
              className={cn(
                "h-3 w-3 rounded-sm border border-border/40 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3",
                contributionCellClass(0)
              )}
            />
            <span
              className={cn(
                "h-3 w-3 rounded-sm border border-border/40 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3",
                contributionCellClass(2)
              )}
            />
            <span
              className={cn(
                "h-3 w-3 rounded-sm border border-border/40 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3",
                contributionCellClass(5)
              )}
            />
            <span
              className={cn(
                "h-3 w-3 rounded-sm border border-border/40 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3",
                contributionCellClass(8)
              )}
            />
            <span
              className={cn(
                "h-3 w-3 rounded-sm border border-border/40 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3",
                contributionCellClass(12)
              )}
            />
          </span>
          <span>{ga.more}</span>
        </div>
      </div>

      <p className="mt-4 px-0">
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
