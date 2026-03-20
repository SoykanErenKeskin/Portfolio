import Link from "next/link";
import { withLocale } from "@/lib/paths";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";

export function SiteFooter({
  locale,
  messages: m,
}: {
  locale: Locale;
  messages: Messages;
}) {
  return (
    <footer className="border-t border-border bg-surface-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {m.footer.rights}
        </p>
        <div className="flex flex-wrap gap-4 font-mono text-[11px] text-ink-muted">
          <Link
            href={withLocale(locale, "/projects")}
            className="hover:text-accent"
          >
            {m.nav.projects}
          </Link>
          <Link
            href={withLocale(locale, "/contact")}
            className="hover:text-accent"
          >
            {m.nav.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
