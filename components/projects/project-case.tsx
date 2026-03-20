import Image from "next/image";
import Link from "next/link";
import { formatRecordDate } from "@/lib/format";
import { withLocale } from "@/lib/paths";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

export function ProjectCase({
  locale,
  messages: m,
  project: p,
}: {
  locale: Locale;
  messages: Messages;
  project: ProjectRecord;
}) {
  return (
    <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-10 border-b border-border pb-8">
        <Link
          href={withLocale(locale, "/projects")}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint transition hover:text-accent"
        >
          {m.projectDetail.back}
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
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
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-12">
        <div className="min-w-0 space-y-8">
          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {m.projectDetail.problem}
            </h2>
            <p className="font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
              {p.problem[locale]}
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {m.projectDetail.approach}
            </h2>
            <p className="font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
              {p.approach[locale]}
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {m.projectDetail.outcome}
            </h2>
            <p className="font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
              {p.outcome[locale]}
            </p>
          </section>

          {p.images.length > 0 ? (
            <section>
              <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                {m.projectDetail.gallery}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {p.images.map((img, i) => (
                  <figure
                    key={`${img.src}-${i}`}
                    className="panel-edge overflow-hidden bg-surface-raised"
                  >
                    <div className="relative aspect-[5/3] w-full">
                      <Image
                        src={img.src}
                        alt={img.alt[locale]}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <figcaption className="border-t border-border px-3 py-2 font-mono text-[10px] text-ink-faint">
                      {img.alt[locale]}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 border-t border-border pt-8 lg:border-t-0 lg:border-l lg:border-border lg:pt-0 lg:pl-8">
          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {m.projectDetail.stack}
            </h2>
            <ul className="space-y-2 font-mono text-[11px] text-ink">
              {p.tech.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-ink-faint">▸</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {m.projectDetail.tools}
            </h2>
            <ul className="space-y-2 font-mono text-[11px] text-ink">
              {p.tools.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-ink-faint">▸</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {p.links?.github || p.links?.live ? (
            <section>
              <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                {m.projectDetail.links}
              </h2>
              <div className="flex flex-col gap-2 font-mono text-[11px]">
                {p.links.github ? (
                  <a
                    href={p.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline-offset-4 transition hover:text-accent hover:underline"
                  >
                    {m.projectDetail.github}
                  </a>
                ) : null}
                {p.links.live ? (
                  <a
                    href={p.links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline-offset-4 transition hover:text-accent hover:underline"
                  >
                    {m.projectDetail.live}
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
