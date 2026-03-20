import Link from "next/link";
import { LocaleToggle } from "@/components/i18n/locale-toggle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { withLocale } from "@/lib/paths";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import { cn } from "@/lib/utils";

function NavLinks({
  locale,
  m,
}: {
  locale: Locale;
  m: Messages;
}) {
  const items = [
    { href: withLocale(locale, "/"), label: m.nav.home },
    { href: withLocale(locale, "/projects"), label: m.nav.projects },
    { href: withLocale(locale, "/contact"), label: m.nav.contact },
  ];

  return (
    <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-muted transition hover:text-ink"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function SocialRow({ m }: { m: Messages }) {
  const links = [
    { href: m.social.github, label: m.social.githubLabel },
    { href: m.social.linkedin, label: m.social.linkedinLabel },
    { href: m.social.website, label: m.social.websiteLabel },
  ];

  return (
    <div className="flex items-center gap-4">
      {links.map((s) => (
        <a
          key={s.href}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-ink-faint underline-offset-4 transition hover:text-accent hover:underline"
        >
          {s.label}
        </a>
      ))}
    </div>
  );
}

export function SiteHeader({
  locale,
  messages: m,
}: {
  locale: Locale;
  messages: Messages;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <Link
              href={withLocale(locale, "/")}
              className="group flex min-w-0 flex-col"
            >
              <span className="truncate font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-ink">
                {m.brand.name}
              </span>
              <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                {m.brand.tagline}
              </span>
            </Link>
            <NavLinks locale={locale} m={m} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <SocialRow m={m} />
            <div className="flex items-center gap-2">
              <LocaleToggle active={locale} />
              <ThemeToggle labels={{ dark: m.theme.dark, light: m.theme.light }} />
            </div>
          </div>
        </div>
        <MobileNav locale={locale} m={m} />
      </header>
  );
}

function MobileNav({ locale, m }: { locale: Locale; m: Messages }) {
  const items = [
    { href: withLocale(locale, "/"), label: m.nav.home },
    { href: withLocale(locale, "/projects"), label: m.nav.projects },
    { href: withLocale(locale, "/contact"), label: m.nav.contact },
  ];

  return (
    <div className="border-t border-border-subtle px-4 py-2 md:hidden">
      <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Mobile primary">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted",
              "hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
