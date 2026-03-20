import Link from "next/link";
import { formatRecordDate } from "@/lib/format";
import { withLocale } from "@/lib/paths";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

export function LatestPreviews({
  locale,
  messages: m,
  projects,
}: {
  locale: Locale;
  messages: Messages;
  projects: ProjectRecord[];
}) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">
            {m.home.latestTitle}
          </h2>
          <Link
            href={withLocale(locale, "/projects")}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint transition hover:text-accent"
          >
            {m.home.fullRegistry}
          </Link>
        </div>

        <div className="flex flex-col">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={withLocale(locale, `/projects/${p.id}`)}
              className="group border-t border-border py-5 first:border-t-0 md:grid md:grid-cols-[1fr_auto] md:items-start md:gap-8"
            >
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    {formatRecordDate(p.date, locale)}
                  </span>
                  <span className="font-mono text-[10px] text-ink-faint">·</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    {p.id}
                  </span>
                </div>
                <h3 className="font-sans text-base font-medium text-ink md:text-lg">
                  {p.title[locale]}
                </h3>
                <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
                  {p.shortDescription[locale]}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <li
                      key={t}
                      className="border border-border-subtle bg-surface-raised px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex items-center justify-end md:mt-0 md:flex-col md:items-end md:justify-start">
                <span className="font-mono text-[11px] text-ink-faint transition group-hover:text-accent">
                  {m.home.inspect}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
