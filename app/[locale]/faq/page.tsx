import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages } from "@/lib/i18n";
import { getFaqByLocale } from "@/lib/db/faq";
import { isLocale } from "@/types/locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: `${m.faq.title} | ${m.meta.title}`,
    description: m.faq.subtitle,
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const m = getMessages(locale);
  const faqItems = await getFaqByLocale(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="mb-10 border-b border-border pb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          {m.faq.subtitle}
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {m.faq.title}
        </h1>
      </header>

      {faqItems.length === 0 ? (
        <p className="border border-dashed border-border px-4 py-6 font-mono text-sm text-ink-muted">
          {m.faq.noItems}
        </p>
      ) : (
        <div
          role="list"
          className="panel-edge overflow-hidden bg-surface-raised"
        >
          {faqItems.map((item, i) => (
            <section
              key={i}
              role="listitem"
              className="border-t border-border first:border-t-0"
            >
              <div className="px-4 py-6 md:px-6 md:py-8">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                  {m.faq.itemLabel}
                  {String(i + 1).padStart(2, "0")}
                </h2>
                <p className="mt-2 font-sans text-base font-medium text-ink md:text-lg">
                  {item.question}
                </p>
                <div className="mt-4 border-l-2 border-accent/50 pl-4 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
                  <span className="whitespace-pre-wrap">{item.answer}</span>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
