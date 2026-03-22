"use client";

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
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`
        max-w-[85%] self-end rounded-2xl px-4 py-3 text-[15px] leading-relaxed
        ${isUser
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
