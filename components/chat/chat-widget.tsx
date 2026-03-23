"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { flushSync } from "react-dom";
import { useParams } from "next/navigation";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import {
  getCrisisResponseText,
  type CrisisLang,
} from "@/lib/chat/sensitive-content";
import {
  CRISIS_LOCK_DURATION_FIRST_MS,
  clearCrisisLock,
  getNextCrisisLockDurationMs,
  loadCrisisLock,
  recordCrisisStrikeAfterLock,
  resetCrisisSafetyState,
  saveCrisisLock,
} from "@/lib/chat/crisis-lock-storage";
import { isLocale } from "@/types/locale";

type ChatMessages = {
  title: string;
  placeholder: string;
  send: string;
  suggestions: string[];
  resumeDirectAnswer: string;
  hint: string;
  crisisLockedPlaceholder: string;
  /** Shown next to the countdown ring (no {seconds} — time is in the dial) */
  crisisCooldownHint: string;
  crisisAdminReset: string;
};

type ChatMessageItem = {
  role: "user" | "assistant";
  content: string;
  crisis?: boolean;
  crisisLang?: CrisisLang;
};

const RESUME_SUGGESTION_INDEX = 4;

export function ChatWidget({
  messages,
  resumeUrl = null,
  isAdmin = false,
}: {
  messages: ChatMessages;
  resumeUrl?: string | null;
  /** Logged-in site admin — can reset lock + strike tier via UI */
  isAdmin?: boolean;
}) {
  const params = useParams();
  const siteLocale: CrisisLang = useMemo(() => {
    const l = params?.locale;
    return typeof l === "string" && isLocale(l) && l === "tr" ? "tr" : "en";
  }, [params?.locale]);

  const [open, setOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatLocked, setChatLocked] = useState(false);
  /** Absolute time (ms) when crisis cooldown ends; persisted in localStorage */
  const [lockUntilMs, setLockUntilMs] = useState<number | null>(null);
  /** Full lock window for progress ring (restored from storage when possible) */
  const [lockDurationMs, setLockDurationMs] = useState(CRISIS_LOCK_DURATION_FIRST_MS);
  /** Smooth countdown + ring */
  const [remainingMs, setRemainingMs] = useState(0);
  /** Prevents double submit before React state updates (parallel requests). */
  const sendingRef = useRef(false);

  /** Restore lock after refresh (same browser). */
  useEffect(() => {
    const data = loadCrisisLock();
    if (!data) return;
    setChatMessages(data.messages as ChatMessageItem[]);
    setChatLocked(true);
    setLockUntilMs(data.until);
    setLockDurationMs(data.durationMs ?? CRISIS_LOCK_DURATION_FIRST_MS);
  }, []);

  /** Smooth countdown + auto-unlock when cooldown ends (layout effect avoids 0:00 flash) */
  useLayoutEffect(() => {
    if (!lockUntilMs) {
      setRemainingMs(0);
      return;
    }
    const tick = () => {
      const rem = Math.max(0, lockUntilMs - Date.now());
      setRemainingMs(rem);
      if (rem <= 0) {
        setChatLocked(false);
        setLockUntilMs(null);
        setChatMessages([]);
        setLockDurationMs(CRISIS_LOCK_DURATION_FIRST_MS);
        clearCrisisLock();
      }
    };
    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [lockUntilMs]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (sendingRef.current) return;

      const stored = loadCrisisLock();
      if (stored && Date.now() < stored.until) {
        setChatLocked(true);
        setLockUntilMs(stored.until);
        setLockDurationMs(stored.durationMs ?? CRISIS_LOCK_DURATION_FIRST_MS);
        if (stored.messages.length) {
          setChatMessages(stored.messages as ChatMessageItem[]);
        }
        return;
      }

      if (chatLocked) return;

      const userMsg: ChatMessageItem = { role: "user", content: text };

      sendingRef.current = true;
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
            locale: siteLocale,
          }),
        });

        const data = (await res.json()) as {
          message?: string;
          error?: string;
          crisis?: boolean;
          crisisLang?: CrisisLang;
        };

        if (data.crisis) {
          const lang: CrisisLang =
            data.crisisLang === "tr" || data.crisisLang === "en"
              ? data.crisisLang
              : siteLocale;
          /** Always show the built-in template — never trust server `message` (could be confused with main LLM). */
          const fixedContent = getCrisisResponseText(lang);
          let nextMessages: ChatMessageItem[] = [];
          flushSync(() => {
            setChatMessages((prev) => {
              nextMessages = [
                ...prev,
                {
                  role: "assistant",
                  content: fixedContent,
                  crisis: true,
                  crisisLang: lang,
                },
              ];
              return nextMessages;
            });
          });
          const durationMs = getNextCrisisLockDurationMs();
          const until = Date.now() + durationMs;
          saveCrisisLock({ until, messages: nextMessages, durationMs });
          recordCrisisStrikeAfterLock();
          setChatLocked(true);
          setLockUntilMs(until);
          setLockDurationMs(durationMs);
          return;
        }

        const content = data.message || data.error || "Something went wrong.";
        setChatMessages((prev) => [...prev, { role: "assistant", content }]);
      } catch {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Connection error. Please try again." },
        ]);
      } finally {
        sendingRef.current = false;
        setIsLoading(false);
      }
    },
    [chatMessages, chatLocked, siteLocale]
  );

  const handleAdminResetCrisis = useCallback(() => {
    resetCrisisSafetyState();
    setChatLocked(false);
    setLockUntilMs(null);
    setLockDurationMs(CRISIS_LOCK_DURATION_FIRST_MS);
    setRemainingMs(0);
  }, []);

  const cooldownHint = chatLocked ? messages.crisisCooldownHint : undefined;

  const handleSuggestionClick = useCallback(
    (q: string) => {
      const isResumeSuggestion =
        messages.suggestions[RESUME_SUGGESTION_INDEX] === q && resumeUrl;
      if (isResumeSuggestion) {
        const fullUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}${resumeUrl}`
            : resumeUrl;
        const directAnswer = `${messages.resumeDirectAnswer} ${fullUrl}`;
        setChatMessages([
          { role: "user", content: q },
          { role: "assistant", content: directAnswer },
        ]);
        return;
      }
      sendMessage(q);
    },
    [messages.suggestions, messages.resumeDirectAnswer, resumeUrl, sendMessage]
  );

  const panelCrisis = chatLocked && open;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={messages.title}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition hover:scale-105 hover:shadow-xl ${
          chatLocked
            ? "border-red-600 bg-red-600 text-white ring-2 ring-red-400/60 hover:bg-red-700 dark:border-red-500 dark:bg-red-800 dark:ring-red-500/50"
            : "border-border/60 bg-surface-raised text-ink"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-6 w-6 ${chatLocked ? "text-white" : "text-ink"}`}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex h-[480px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl ${
            panelCrisis
              ? "border-2 border-red-600 bg-red-50 text-red-950 shadow-xl shadow-red-900/20 dark:border-red-500 dark:bg-red-950/90 dark:text-red-50 dark:shadow-red-950/40"
              : "border border-border/60 bg-surface text-ink shadow-xl"
          }`}
          style={
            panelCrisis
              ? { boxShadow: "0 8px 32px rgb(127 29 29 / 0.35)" }
              : { boxShadow: "0 8px 32px rgb(0 0 0 / 0.15)" }
          }
        >
          <div
            className={`flex items-center justify-between gap-2 border-b px-4 py-3 font-mono text-[12px] uppercase tracking-wider ${
              panelCrisis
                ? "border-red-600 bg-red-100 text-red-900 dark:border-red-600 dark:bg-red-900/80 dark:text-red-100"
                : "border-border/50 bg-surface-raised/80 text-ink-muted"
            }`}
          >
            <span className="min-w-0 truncate">{messages.title}</span>
            {isAdmin ? (
              <button
                type="button"
                onClick={handleAdminResetCrisis}
                title={messages.crisisAdminReset}
                className={`shrink-0 rounded-md border px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition ${
                  panelCrisis
                    ? "border-red-700 bg-red-50 text-red-900 hover:bg-red-100 dark:border-red-400 dark:bg-red-950/80 dark:text-red-100 dark:hover:bg-red-900/70"
                    : "border-border/60 bg-surface-raised text-ink-muted hover:border-accent/40 hover:text-ink"
                }`}
              >
                {messages.crisisAdminReset}
              </button>
            ) : null}
          </div>

          {chatMessages.length === 0 ? (
            <div className="chat-scroll-themed flex flex-1 flex-col overflow-y-auto p-4">
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
            <ChatMessageList
              messages={chatMessages}
              isLoading={isLoading}
              ambientCrisis={chatLocked}
            />
          )}

          <ChatInput
            onSend={sendMessage}
            placeholder={
              chatLocked
                ? messages.crisisLockedPlaceholder
                : messages.placeholder
            }
            sendLabel={messages.send}
            disabled={isLoading || chatLocked}
            locked={chatLocked}
            cooldownRemainingMs={chatLocked ? remainingMs : undefined}
            cooldownTotalMs={chatLocked ? lockDurationMs : undefined}
            cooldownHint={cooldownHint}
          />
        </div>
      )}
    </>
  );
}
