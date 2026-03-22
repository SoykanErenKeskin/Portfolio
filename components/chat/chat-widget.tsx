"use client";

import { useState, useCallback } from "react";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";

type ChatMessages = {
  title: string;
  placeholder: string;
  send: string;
  suggestions: string[];
  hint: string;
};

export function ChatWidget({ messages }: { messages: ChatMessages }) {
  const [open, setOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg = { role: "user" as const, content: text };
      setChatMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...chatMessages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = (await res.json()) as { message?: string; error?: string };
        const content = data.message || data.error || "Something went wrong.";
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content },
        ]);
      } catch {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Connection error. Please try again." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatMessages]
  );

  const handleSuggestionClick = (q: string) => sendMessage(q);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={messages.title}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-surface-raised shadow-lg transition hover:scale-105 hover:shadow-xl"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-ink"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-xl"
          style={{ boxShadow: "0 8px 32px rgb(0 0 0 / 0.15)" }}
        >
          <div className="border-b border-border/50 bg-surface-raised/80 px-4 py-3 font-mono text-[12px] uppercase tracking-wider text-ink-muted">
            {messages.title}
          </div>

          {chatMessages.length === 0 ? (
            <div className="flex flex-1 flex-col overflow-y-auto p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                {messages.hint}
              </p>
              <div className="flex flex-col gap-1.5">
                {messages.suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="group flex items-center gap-3 rounded-lg border border-border/40 bg-surface-raised/60 px-3.5 py-2.5 text-left text-[13px] text-ink transition hover:border-accent/50 hover:bg-accent/5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 font-mono text-[10px] font-medium text-accent">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{s}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-3.5 w-3.5 shrink-0 text-ink-faint transition group-hover:text-accent"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ChatMessageList messages={chatMessages} isLoading={isLoading} />
          )}

          <ChatInput
            onSend={sendMessage}
            placeholder={messages.placeholder}
            sendLabel={messages.send}
            disabled={isLoading}
          />
        </div>
      )}
    </>
  );
}
