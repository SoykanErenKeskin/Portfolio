import Link from "next/link";
import { formatRecordDate } from "@/lib/format";
import { isValidLink } from "@/lib/project-images";
import { withLocale } from "@/lib/paths";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

export function ProjectCaseHeader({
  locale,
  messages: m,
  project: p,
}: {
  locale: Locale;
  messages: Messages;
  project: ProjectRecord;
}) {
  return (
    <header className="border-b border-border pb-8">
      <Link
        href={withLocale(locale, "/projects")}
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint transition hover:text-accent"
      >
        {m.projectDetail.back}
      </Link>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {m.projectDetail.caseLabel}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        <span>
          {m.projects.recordPrefix}:{p.id}
        </span>
        <span>·</span>
        <time dateTime={p.date}>{formatRecordDate(p.date, locale)}</time>
      </div>
      <h1 className="mt-4 max-w-3xl font-sans text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {p.title[locale]}
      </h1>
      <p className="mt-4 max-w-3xl border-l-2 border-accent/40 pl-4 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
        {p.summary[locale]}
      </p>
      {(isValidLink(p.links?.github) || isValidLink(p.links?.live)) && (
        <div className="mt-6 flex flex-wrap gap-4 font-mono text-[11px]">
          {isValidLink(p.links?.github) ? (
            <a
              href={p.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-ink-muted underline-offset-4 transition hover:text-accent hover:underline"
            >
              {m.projectDetail.github}
            </a>
          ) : null}
          {isValidLink(p.links?.live) ? (
            <a
              href={p.links.live}
              target="_blank"
              rel="noreferrer"
              className="text-ink-muted underline-offset-4 transition hover:text-accent hover:underline"
            >
              {m.projectDetail.live}
            </a>
          ) : null}
        </div>
      )}
    </header>
  );
}
