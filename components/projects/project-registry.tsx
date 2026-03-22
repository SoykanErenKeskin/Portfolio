"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatRecordDate } from "@/lib/format";
import { withLocale } from "@/lib/paths";
import { filterProjectsByTags } from "@/lib/projects";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

export function ProjectRegistry({
  locale,
  messages: m,
  projects,
  allTags,
}: {
  locale: Locale;
  messages: Messages;
  projects: ProjectRecord[];
  allTags: string[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeTags = useMemo(() => {
    const all = searchParams.getAll("tag");
    return [...new Set(all)].filter(Boolean);
  }, [searchParams]);

  const filtered = useMemo(
    () => filterProjectsByTags(projects, activeTags),
    [projects, activeTags]
  );

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = new Set(params.getAll("tag"));
    if (current.has(tag)) current.delete(tag);
    else current.add(tag);
    params.delete("tag");
    current.forEach((t) => params.append("tag", t));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clear = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="mb-10 border-b border-border pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          {m.projects.subtitle}
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {m.projects.title}
        </h1>
      </header>

      <div className="mb-8 flex flex-col gap-4 border border-border bg-surface-raised p-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            {m.projects.filterLabel}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const on = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "border px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition",
                    on
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-subtle text-ink-muted hover:border-accent/40 hover:text-ink"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
        {activeTags.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 self-start border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted transition hover:border-accent/40 hover:text-ink"
          >
            {m.projects.clearFilters}
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-6 font-mono text-sm text-ink-muted">
          {m.projects.noMatches}
        </p>
      ) : (
        <div role="list" className="flex flex-col">
          {filtered.map((p) => (
            <article
              key={p.id}
              role="listitem"
              className="border-t border-border first:border-t-0"
            >
              <Link
                href={withLocale(locale, `/projects/${p.id}`)}
                className="group block py-6 transition hover:bg-surface-raised/60"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                      <span>
                        {m.projects.recordPrefix}:{p.id}
                      </span>
                      <span className="text-ink-faint">·</span>
                      <time dateTime={p.date}>
                        {formatRecordDate(p.date, locale)}
                      </time>
                    </div>
                    <h2 className="mt-2 font-sans text-lg font-medium text-ink md:text-xl">
                      {p.title[locale]}
                    </h2>
                    <p className="mt-2 max-w-3xl font-sans text-sm leading-relaxed text-ink-muted">
                      {p.shortDescription[locale]}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <li
                          key={t}
                          className="border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex shrink-0 items-center justify-end md:pt-1">
                    <span className="font-mono text-[11px] text-ink-faint transition group-hover:text-accent">
                      {m.projects.openRecord}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
