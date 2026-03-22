"use client";

import { useState, useRef, useEffect } from "react";

const MAX_HEIGHT = 120;

/** Circular progress + mm:ss — smooth with sub-second updates from parent */
function CrisisCooldownMeter({
  remainingMs,
  totalMs,
  hint,
}: {
  remainingMs: number;
  totalMs: number;
  hint: string;
}) {
  const size = 76;
  const strokeW = 3.5;
  const r = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * r;
  const safeTotal = Math.max(1, totalMs);
  const ratio = Math.min(1, Math.max(0, remainingMs / safeTotal));
  const dashOffset = circumference * (1 - ratio);

  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const timeLabel = `${m}:${String(s).padStart(2, "0")}`;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={hint}
      className="flex w-full items-center gap-4"
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 drop-shadow-sm"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-red-200/90 dark:stroke-red-800/80"
            strokeWidth={strokeW}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-red-600 transition-[stroke-dashoffset] duration-100 ease-linear dark:stroke-red-400"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono text-[22px] font-semibold tabular-nums tracking-tight text-red-950 dark:text-red-50"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {timeLabel}
          </span>
        </div>
      </div>
      <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-red-900/95 dark:text-red-100/95">
        {hint}
      </p>
    </div>
  );
}

export function ChatInput({
  onSend,
  placeholder,
  sendLabel,
  disabled,
  locked,
  cooldownRemainingMs,
  cooldownTotalMs,
  cooldownHint,
}: {
  onSend: (text: string) => void;
  placeholder: string;
  sendLabel: string;
  disabled?: boolean;
  /** Safety lock — no further messages */
  locked?: boolean;
  /** Remaining lock time (ms), updated frequently for smooth ring */
  cooldownRemainingMs?: number;
  /** Full lock window (ms) — for ring ratio */
  cooldownTotalMs?: number;
  /** Short line under the timer (no duplicate seconds) */
  cooldownHint?: string;
}) {
  const [value, setValue] = useState("");
  const [overflow, setOverflow] = useState<"hidden" | "auto">("hidden");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      const h = Math.min(ta.scrollHeight, MAX_HEIGHT);
      ta.style.height = `${h}px`;
      setOverflow(h >= MAX_HEIGHT ? "auto" : "hidden");
    }
  }, [value]);

  const handleSubmit = () => {
    const t = value.trim();
    if (!t || disabled || locked) return;
    onSend(t);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showMeter =
    locked &&
    Boolean(cooldownHint) &&
    typeof cooldownRemainingMs === "number" &&
    typeof cooldownTotalMs === "number" &&
    cooldownRemainingMs >= 0;

  return (
    <div
      className={`flex gap-2 border-t p-3 ${
        locked
          ? "flex-col border-red-600 bg-red-100 dark:border-red-700 dark:bg-red-900/70"
          : "items-end border-border/50 bg-surface"
      }`}
    >
      {locked ? (
        <div
          role="status"
          className="w-full space-y-3 rounded-xl border border-red-700 bg-red-50 px-4 py-3 text-left text-[13px] leading-relaxed text-red-950 shadow-inner shadow-red-900/10 dark:border-red-500 dark:bg-red-950/80 dark:text-red-100 dark:shadow-red-950/30"
        >
          <p className="font-medium">{placeholder}</p>
          {showMeter && cooldownHint ? (
            <CrisisCooldownMeter
              remainingMs={cooldownRemainingMs!}
              totalMs={cooldownTotalMs!}
              hint={cooldownHint}
            />
          ) : cooldownHint ? (
            <p className="text-[12px] text-red-800 dark:text-red-200">{cooldownHint}</p>
          ) : null}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`flex-1 resize-none rounded-xl border border-border/60 bg-surface-raised px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none focus:ring-0 disabled:opacity-60 ${
            overflow === "auto"
              ? "chat-scroll-themed overflow-y-auto"
              : "overflow-y-hidden"
          }`}
          style={{ minHeight: 48, maxHeight: MAX_HEIGHT }}
        />
      )}
      {!locked && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-xl border border-accent/40 bg-accent/15 px-4 py-3 font-mono text-[12px] uppercase tracking-wider text-accent transition hover:bg-accent/25 disabled:opacity-50 disabled:hover:bg-accent/15"
        >
          {sendLabel}
        </button>
      )}
    </div>
  );
}
