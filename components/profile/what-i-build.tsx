import type { WhatIBuildCard } from "@/lib/profile/types";
import { QuaroxCloudIcon } from "@/components/profile/icons/quarox-cloud-icon";

type Props = {
  cards: WhatIBuildCard[];
};

const ICON_TITLES = [
  "Engineering systems node",
  "Data intelligence node",
  "Digital products node",
] as const;

export function WhatIBuild({ cards }: Props) {
  return (
    <section aria-labelledby="what-i-build-heading">
      <header className="mb-6">
        <p className="gp-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--gp-coral))]">
          Practice
        </p>
        <h2
          id="what-i-build-heading"
          className="mt-2 font-profile-sans text-2xl font-semibold tracking-tight text-[rgb(var(--gp-ink))] sm:text-3xl"
        >
          What I Build
        </h2>
      </header>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <li key={card.id}>
            <article className="gp-cut-sm gp-panel group flex h-full flex-col p-5 transition duration-300 hover:border-[rgb(var(--gp-coral)/0.4)] hover:shadow-[0_0_24px_-10px_rgb(var(--gp-coral)/0.45)] motion-reduce:transition-none">
              <div className="flex items-start justify-between gap-3">
                <QuaroxCloudIcon
                  className="h-9 w-9 transition duration-300 group-hover:translate-y-[-2px] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                  title={ICON_TITLES[index] ?? "Capability node"}
                />
                <span className="gp-mono text-[10px] text-[rgb(var(--gp-ink-faint))]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-4 font-profile-sans text-lg font-semibold text-[rgb(var(--gp-ink))]">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[rgb(var(--gp-ink-muted))]">
                {card.description}
              </p>
              <ul className="mt-5 flex flex-col gap-2">
                {card.modules.map((mod) => (
                  <li
                    key={mod}
                    className="gp-mono border border-[rgb(var(--gp-border))] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--gp-ink-muted))] transition duration-300 group-hover:border-[rgb(var(--gp-coral)/0.35)] motion-reduce:transition-none"
                  >
                    {mod}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
