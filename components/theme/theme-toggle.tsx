"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ labels }: { labels: { dark: string; light: string } }) {
  const { theme, toggle, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 border border-border bg-surface-raised px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-ink-muted transition hover:border-accent/40 hover:text-ink",
        !mounted && "opacity-70"
      )}
      aria-label={theme === "dark" ? labels.light : labels.dark}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          theme === "dark" ? "bg-ink-muted" : "bg-accent"
        )}
      />
      {theme === "dark" ? labels.dark : labels.light}
    </button>
  );
}
