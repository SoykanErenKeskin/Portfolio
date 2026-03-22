"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; isDashboard?: boolean };

export function MobileMenu({
  items,
}: {
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-border/60 transition hover:border-accent/40 hover:bg-surface-raised"
      >
        <span
          className={cn(
            "h-0.5 w-4 rounded-full bg-ink transition-transform duration-200",
            open && "translate-y-2 rotate-45"
          )}
        />
        <span
          className={cn(
            "h-0.5 w-4 rounded-full bg-ink transition-opacity duration-200",
            open && "opacity-0"
          )}
        />
        <span
          className={cn(
            "h-0.5 w-4 rounded-full bg-ink transition-transform duration-200",
            open && "-translate-y-2 -rotate-45"
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-lg transition-all duration-200 ease-out",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav
          className="border-t border-border-subtle bg-surface-raised/95 px-4 py-4 backdrop-blur-sm"
          aria-label="Mobil menü"
        >
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition",
                    item.isDashboard
                      ? "bg-admin-violet/10 text-admin-violet hover:bg-admin-violet/20"
                      : "text-ink-muted hover:bg-surface-raised hover:text-ink"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
