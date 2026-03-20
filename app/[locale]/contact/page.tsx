import { notFound } from "next/navigation";
import { getMessages } from "@/lib/i18n";
import { isLocale } from "@/types/locale";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const m = getMessages(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <header className="mb-10 border-b border-border pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          {m.contact.subtitle}
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {m.contact.title}
        </h1>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="border border-border bg-surface-raised p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {m.contact.emailLabel}
          </h2>
          <a
            href={`mailto:${m.contact.email}`}
            className="mt-3 inline-block font-mono text-sm text-accent underline-offset-4 transition hover:underline"
          >
            {m.contact.email}
          </a>
        </section>

        <section className="border border-border bg-surface-raised p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {m.contact.channels}
          </h2>
          <div className="mt-4 flex flex-col gap-3 font-mono text-sm">
            <a
              href={m.social.github}
              target="_blank"
              rel="noreferrer"
              className="text-ink transition hover:text-accent"
            >
              {m.social.githubLabel}
            </a>
            <a
              href={m.social.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-ink transition hover:text-accent"
            >
              {m.social.linkedinLabel}
            </a>
            <a
              href={m.social.website}
              target="_blank"
              rel="noreferrer"
              className="text-ink transition hover:text-accent"
            >
              {m.social.websiteLabel}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
