"use client";

import type { CrisisLang } from "@/lib/chat/sensitive-content";

const URL_REGEX = /(https?:\/\/[^\s<>")\]]+)/g;

/** Renders message content with **bold** and clickable links */
function renderContent(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.flatMap((p, i) => {
    if (/^https?:\/\//.test(p)) {
      return [
        <a
          key={i}
          href={p}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline break-all hover:opacity-80"
        >
          {p}
        </a>,
      ];
    }
    const boldParts = p.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) =>
      bp.startsWith("**") && bp.endsWith("**") ? (
        <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>
      ) : (
        <span key={`${i}-${j}`}>{bp}</span>
      )
    );
  });
}

export function ChatMessage({
  role,
  content,
  crisis,
  crisisLang,
  ambientCrisis,
}: {
  role: "user" | "assistant";
  content: string;
  crisis?: boolean;
  crisisLang?: CrisisLang;
  /** Entire chat is in safety lock — tint user/assistant bubbles */
  ambientCrisis?: boolean;
}) {
  const isUser = role === "user";

  if (crisis) {
    const title =
      crisisLang === "en"
        ? "Warning · Safety notice"
        : "Uyarı · Güvenlik bildirimi";
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="w-full max-w-full rounded-xl border-2 border-red-700 bg-red-100 px-4 py-3 text-[15px] leading-relaxed text-red-900 shadow-sm dark:border-red-500 dark:bg-red-950/80 dark:text-red-50"
      >
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-800 dark:text-red-200">
          {title}
        </p>
        <div className="whitespace-pre-wrap break-words text-red-900 dark:text-red-50">
          {renderContent(content)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        max-w-[85%] self-end rounded-2xl px-4 py-3 text-[15px] leading-relaxed
        ${ambientCrisis
          ? isUser
            ? "border border-red-400/60 bg-red-200/80 text-red-950 dark:border-red-600/60 dark:bg-red-900/50 dark:text-red-50"
            : "border border-red-400/50 bg-red-100/90 text-red-950 dark:border-red-700/50 dark:bg-red-900/40 dark:text-red-50"
          : isUser
            ? "bg-accent/15 text-ink border border-accent/20"
            : "bg-surface-raised text-ink border border-border/60"
        }
      `}
      style={{ alignSelf: isUser ? "flex-end" : "flex-start" }}
    >
      <div className="whitespace-pre-wrap break-words">
        {renderContent(content)}
      </div>
    </div>
  );
}
