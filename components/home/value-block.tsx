import type { Messages } from "@/types/messages";

export function ValueBlock({ messages: m }: { messages: Messages }) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-ink-faint">
          <span
            className="status-indicator h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
            aria-hidden
          />
          {m.home.statusLine}
        </p>
        <h1 className="max-w-3xl font-sans text-2xl font-semibold leading-snug tracking-tight text-ink md:text-3xl">
          {m.home.valueProp}
        </h1>
        <p className="mt-6 max-w-2xl border-l-2 border-accent/50 pl-4 font-sans text-sm leading-relaxed text-ink-muted md:text-[15px]">
          {m.home.supporting}
        </p>
      </div>
    </section>
  );
}
