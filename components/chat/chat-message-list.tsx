"use client";

import { ChatMessage } from "./chat-message";

type Msg = {
  role: "user" | "assistant";
  content: string;
  crisis?: boolean;
  crisisLang?: "tr" | "en";
};

export function ChatMessageList({
  messages,
  isLoading,
  ambientCrisis,
}: {
  messages: Msg[];
  isLoading: boolean;
  /** Safety lock — red-tint non-crisis bubbles + loading */
  ambientCrisis?: boolean;
}) {
  const crisisScrollStyles = ambientCrisis
    ? [
        "bg-red-100/50 dark:bg-red-950/40",
        "[scrollbar-width:thin]",
        "[scrollbar-color:rgba(185,28,28,0.75)_rgba(254,226,226,0.95)]",
        "dark:[scrollbar-color:rgba(220,38,38,0.8)_rgba(69,10,10,0.55)]",
        "[&::-webkit-scrollbar]:w-2",
        "[&::-webkit-scrollbar-track]:rounded-full",
        "[&::-webkit-scrollbar-track]:bg-red-100/95",
        "dark:[&::-webkit-scrollbar-track]:bg-red-950/70",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:bg-red-500/75",
        "[&::-webkit-scrollbar-thumb]:hover:bg-red-600/85",
        "dark:[&::-webkit-scrollbar-thumb]:bg-red-600/75",
        "dark:[&::-webkit-scrollbar-thumb]:hover:bg-red-500/85",
      ].join(" ")
    : "chat-scroll-themed";

  return (
    <div
      className={`flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 ${crisisScrollStyles}`}
    >
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex w-full ${m.crisis ? "justify-stretch" : ""}`}
          style={
            m.crisis
              ? undefined
              : { justifyContent: m.role === "user" ? "flex-end" : "flex-start" }
          }
        >
          <ChatMessage
            role={m.role}
            content={m.content}
            crisis={m.crisis}
            crisisLang={m.crisisLang}
            ambientCrisis={ambientCrisis && !m.crisis}
          />
        </div>
      ))}
      {isLoading && (
        <div className="flex w-full justify-start">
          <div
            className={`rounded-2xl border px-4 py-3 ${
              ambientCrisis
                ? "border-red-500/60 bg-red-200/80 dark:border-red-500/50 dark:bg-red-900/50"
                : "border-border/60 bg-surface-raised"
            }`}
          >
            <span className="inline-flex gap-1">
              <span
                className={`h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s] ${
                  ambientCrisis ? "bg-red-600 dark:bg-red-400" : "bg-ink-muted"
                }`}
              />
              <span
                className={`h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s] ${
                  ambientCrisis ? "bg-red-600 dark:bg-red-400" : "bg-ink-muted"
                }`}
              />
              <span
                className={`h-2 w-2 animate-bounce rounded-full ${
                  ambientCrisis ? "bg-red-600 dark:bg-red-400" : "bg-ink-muted"
                }`}
              />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
