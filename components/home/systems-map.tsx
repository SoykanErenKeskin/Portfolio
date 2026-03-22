import type { Messages } from "@/types/messages";
import type { LearningEntry } from "@/lib/db/learning-timeline";
import type { CapabilityCategory } from "@/lib/db/capability-map";
import { LearningTimeline } from "./learning-timeline";
import { cn } from "@/lib/utils";

type SystemsMapProps = {
  messages: Messages;
  learningTimeline: LearningEntry[];
  capabilityMap?: CapabilityCategory[];
  locale: "en" | "tr";
};

export function SystemsMap({ messages: m, learningTimeline, capabilityMap, locale }: SystemsMapProps) {
  const categories =
    capabilityMap && capabilityMap.length > 0
      ? capabilityMap.map((cat) => ({
          key: cat.key,
          label: locale === "tr" ? (cat.labelTr || cat.labelEn) : (cat.labelEn || cat.labelTr),
          items: locale === "tr" ? (cat.itemsTr.length ? cat.itemsTr : cat.itemsEn) : (cat.itemsEn.length ? cat.itemsEn : cat.itemsTr),
        }))
      : m.home.systemsCategories;
  return (
    <section className="border-b border-border bg-surface-raised/40">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">
              {m.home.systemsTitle}
            </h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              {m.home.systemsSubtitle}
            </p>
          </div>
          <div className="hidden font-mono text-[10px] text-ink-faint md:block">
            {m.home.systemsFigure}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((cat, i) => (
            <div
              key={cat.key}
              className={cn(
                "panel-edge relative overflow-hidden bg-surface p-4",
                "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgb(var(--accent)_/_0.06),transparent_40%)]"
              )}
            >
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-right font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  {cat.label}
                </span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 font-mono text-[11px]">
                {cat.items.map((item, i) => {
                  const last = i === cat.items.length - 1;
                  return (
                    <div key={item} className="contents">
                      <span className="text-ink-faint">{last ? "└" : "├"}</span>
                      <span className="text-ink">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <LearningTimeline messages={m} items={learningTimeline} locale={locale} />
      </div>
    </section>
  );
}
