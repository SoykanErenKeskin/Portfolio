"use client";

import { ChatMessage } from "./chat-message";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatMessageList({
  messages,
  isLoading,
}: {
  messages: Msg[];
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4">
      {messages.map((m, i) => (
        <div
          key={i}
          className="flex w-full"
          style={{
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <ChatMessage role={m.role} content={m.content} />
        </div>
      ))}
      {isLoading && (
        <div className="flex w-full justify-start">
          <div className="rounded-2xl border border-border/60 bg-surface-raised px-4 py-3">
            <span className="inline-flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-muted" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
