import Link from "next/link";
import { withLocale } from "@/lib/paths";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

export function RelatedProjects({
  prev,
  next,
  locale,
  messages: m,
}: {
  prev: ProjectRecord | null;
  next: ProjectRecord | null;
  locale: Locale;
  messages: Messages;
}) {
  if (!prev && !next) return null;

  return (
    <section className="border-t border-border pt-8">
      <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        {m.projectDetail.relatedRecords}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {prev ? (
          <Link
            href={withLocale(locale, `/projects/${prev.id}`)}
            className="group block border border-border bg-surface-raised p-4 transition hover:border-accent/40"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              ← {m.projectDetail.previousCase}
            </span>
            <p className="mt-2 font-sans text-sm font-medium text-ink group-hover:text-accent">
              {prev.title[locale]}
            </p>
            <p className="mt-1 line-clamp-2 font-sans text-[13px] text-ink-muted">
              {prev.shortDescription[locale]}
            </p>
          </Link>
        ) : (
          <div className="border border-dashed border-border p-4" />
        )}
        {next ? (
          <Link
            href={withLocale(locale, `/projects/${next.id}`)}
            className="group block border border-border bg-surface-raised p-4 transition hover:border-accent/40"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {m.projectDetail.nextCase} →
            </span>
            <p className="mt-2 font-sans text-sm font-medium text-ink group-hover:text-accent">
              {next.title[locale]}
            </p>
            <p className="mt-1 line-clamp-2 font-sans text-[13px] text-ink-muted">
              {next.shortDescription[locale]}
            </p>
          </Link>
        ) : (
          <div className="border border-dashed border-border p-4" />
        )}
      </div>
    </section>
  );
}
