"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/types/locale";
import type { Locale } from "@/types/locale";
import { cn } from "@/lib/utils";

export function LocaleToggle({ active }: { active: Locale }) {
  const pathname = usePathname();
  const suffix = pathname.replace(/^\/(en|tr)/, "") || "/";

  return (
    <div
      className="flex items-center gap-0 border border-border bg-surface-raised font-mono text-[11px] uppercase tracking-wide"
      role="group"
      aria-label="Language"
    >
      {locales.map((l) => {
        const href = suffix === "/" ? `/${l}` : `/${l}${suffix}`;
        const isOn = l === active;
        return (
          <Link
            key={l}
            href={href}
            className={cn(
              "px-2 py-1 transition",
              isOn
                ? "bg-ink text-surface"
                : "text-ink-muted hover:bg-surface hover:text-ink"
            )}
          >
            {l}
          </Link>
        );
      })}
    </div>
  );
}
