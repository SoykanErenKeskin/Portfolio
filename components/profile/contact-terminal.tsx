import Link from "next/link";
import type { ContactTerminalSpec } from "@/lib/profile/types";

type Props = {
  contact: ContactTerminalSpec;
};

export function ContactTerminal({ contact }: Props) {
  return (
    <section aria-labelledby="contact-heading">
      <header className="mb-6">
        <p className="gp-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--gp-coral))]">
          Signal
        </p>
        <h2
          id="contact-heading"
          className="mt-2 font-profile-sans text-2xl font-semibold tracking-tight text-[rgb(var(--gp-ink))] sm:text-3xl"
        >
          Contact
        </h2>
      </header>

      <div className="gp-cut gp-panel overflow-hidden">
        <p className="border-b border-[rgb(var(--gp-border-subtle))] px-5 py-5 font-profile-sans text-base leading-relaxed text-[rgb(var(--gp-ink-muted))] sm:text-lg">
          {contact.statement}
        </p>

        <div className="space-y-3 px-5 py-5">
          <p className="gp-mono text-sm text-[rgb(var(--gp-ink-muted))] break-words">
            <span className="text-[rgb(var(--gp-coral))]">&gt;</span> open_to:{" "}
            <span className="text-[rgb(var(--gp-ink))]">{contact.openTo}</span>
          </p>
          <p className="gp-mono text-sm text-[rgb(var(--gp-ink-muted))] break-words">
            <span className="text-[rgb(var(--gp-coral))]">&gt;</span> connect:{" "}
            {contact.connect.map((item, index) => (
              <span key={item.label}>
                {index > 0 ? (
                  <span className="text-[rgb(var(--gp-ink-faint))]"> · </span>
                ) : null}
                <Link
                  href={item.href}
                  className="gp-focus text-[rgb(var(--gp-ink))] underline decoration-[rgb(var(--gp-coral)/0.45)] underline-offset-4 transition hover:text-[rgb(var(--gp-coral))]"
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </p>
          <p className="gp-mono text-sm text-[rgb(var(--gp-ink-muted))] break-words">
            <span className="text-[rgb(var(--gp-coral))]">&gt;</span> status:{" "}
            <span className="text-[rgb(var(--gp-ink))]">{contact.status}</span>
          </p>
          <p className="gp-mono mt-4 text-sm text-[rgb(var(--gp-ink))]">
            <span className="text-[rgb(var(--gp-coral))]">&gt;</span>{" "}
            {contact.prompt}
            <span
              className="gp-cursor ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[rgb(var(--gp-coral))] align-middle"
              aria-hidden
            />
            <span className="sr-only">Cursor</span>
          </p>
        </div>
      </div>
    </section>
  );
}
