import { cn } from "@/lib/utils";

export function CaseAccordion({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cn(
        "group border border-border bg-surface-raised open:border-border",
        className
      )}
    >
      <summary
        className={cn(
          "cursor-pointer list-none px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint",
          "outline-none transition hover:text-ink",
          "focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "[&::-webkit-details-marker]:hidden"
        )}
      >
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="text-ink-faint transition group-open:rotate-90"
          >
            ▸
          </span>
          {title}
        </span>
      </summary>
      <div className="border-t border-border px-4 py-3 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
        {children}
      </div>
    </details>
  );
}
