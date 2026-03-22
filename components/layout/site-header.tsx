import Link from "next/link";
import { LocaleToggle } from "@/components/i18n/locale-toggle";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { withLocale } from "@/lib/paths";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import { cn } from "@/lib/utils";

function NavLinks({
  locale,
  m,
  isAdmin,
}: {
  locale: Locale;
  m: Messages;
  isAdmin?: boolean;
}) {
  const items = [
    { href: withLocale(locale, "/"), label: m.nav.home },
    { href: withLocale(locale, "/projects"), label: m.nav.projects },
    { href: withLocale(locale, "/faq"), label: m.nav.faq },
    { href: withLocale(locale, "/contact"), label: m.nav.contact },
    ...(isAdmin ? [{ href: "/admin/dashboard", label: m.nav.dashboard }] : []),
  ];

  const isDashboard = (href: string) => href === "/admin/dashboard";

  return (
    <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "font-mono text-[12px] uppercase tracking-[0.12em] transition",
            isDashboard(item.href)
              ? "rounded-lg bg-admin-violet/10 px-3 py-1.5 text-[11px] tracking-[0.14em] text-admin-violet hover:bg-admin-violet/20"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function DocIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 14"
      className="h-2.5 w-2.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      <path d="M7 1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L7 1Z" />
      <path d="M7 1v4h4" />
    </svg>
  );
}

function SocialRow({ m }: { m: Messages }) {
  const links = [
    { href: m.social.github, label: m.social.githubLabel },
    { href: m.social.linkedin, label: m.social.linkedinLabel },
    { href: m.social.website, label: m.social.websiteLabel },
  ];

  return (
    <div className="flex items-center gap-3">
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
  isAdmin,
  resumeUrl,
}: {
  locale: Locale;
  messages: Messages;
  isAdmin?: boolean;
  resumeUrl?: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="relative mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
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
              <div className="flex items-center gap-3">
                <NavLinks locale={locale} m={m} isAdmin={isAdmin} />
                <MobileMenu
                  items={[
                    { href: withLocale(locale, "/"), label: m.nav.home },
                    { href: withLocale(locale, "/projects"), label: m.nav.projects },
                    { href: withLocale(locale, "/faq"), label: m.nav.faq },
                    { href: withLocale(locale, "/contact"), label: m.nav.contact },
                    ...(isAdmin
                      ? [{ href: "/admin/dashboard", label: m.nav.dashboard, isDashboard: true }]
                      : []),
                  ]}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <SocialRow m={m} />
              <div className="flex items-center gap-2">
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-border bg-surface-raised px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-ink-muted transition hover:border-accent/40 hover:text-ink"
                  >
                    <DocIcon />
                    {m.social.resumeLabel}
                  </a>
                )}
                <LocaleToggle active={locale} />
                <ThemeToggle labels={{ dark: m.theme.dark, light: m.theme.light }} />
              </div>
            </div>
          </div>
        </div>
      </header>
  );
}
