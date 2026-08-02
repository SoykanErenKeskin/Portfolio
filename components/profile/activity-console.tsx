import type { ActivityGroup } from "@/lib/profile/types";

type Props = {
  groups: ActivityGroup[];
};

export function ActivityConsole({ groups }: Props) {
  return (
    <section aria-labelledby="activity-heading">
      <header className="mb-6">
        <p className="gp-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--gp-coral))]">
          Feed
        </p>
        <h2
          id="activity-heading"
          className="mt-2 font-profile-sans text-2xl font-semibold tracking-tight text-[rgb(var(--gp-ink))] sm:text-3xl"
        >
          Recent Activity
        </h2>
      </header>

      <div
        className="gp-cut gp-panel overflow-hidden"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="flex items-center justify-between border-b border-[rgb(var(--gp-border-subtle))] px-4 py-3 sm:px-5">
          <p className="gp-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--gp-ink-faint))]">
            System activity
          </p>
          <p className="gp-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--gp-ink-faint))]">
            Live feed
          </p>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-5">
          {groups.length === 0 ? (
            <p className="gp-mono text-sm text-[rgb(var(--gp-ink-muted))]">
              No recent meaningful activity
            </p>
          ) : (
            groups.map((group, index) => (
              <div
                key={group.projectKey}
                className="gp-activity-enter"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="gp-mono text-xs font-medium uppercase tracking-[0.14em] text-[rgb(var(--gp-coral))]">
                  <span className="text-[rgb(var(--gp-ink-faint))]">&gt;</span>{" "}
                  {group.projectLabel}
                </p>
                <ul className="mt-2 space-y-1 border-l border-[rgb(var(--gp-border))] pl-3">
                  {group.items.map((item, i) => {
                    const isLast = i === group.items.length - 1;
                    return (
                      <li
                        key={`${group.projectKey}-${item.text}`}
                        className="gp-mono text-sm text-[rgb(var(--gp-ink-muted))]"
                      >
                        {item.text}
                        {isLast ? (
                          <span className="text-[rgb(var(--gp-ink-faint))]">
                            {" "}
                            · {group.relativeTime}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
