"use client";

import { useState, useRef, useEffect } from "react";

const MAX_HEIGHT = 120;

export function ChatInput({
  onSend,
  placeholder,
  sendLabel,
  disabled,
}: {
  onSend: (text: string) => void;
  placeholder: string;
  sendLabel: string;
  disabled?: boolean;
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
    if (!t || disabled) return;
    onSend(t);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-border/50 bg-surface p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={`flex-1 resize-none rounded-xl border border-border/60 bg-surface-raised px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-ink/40 focus:outline-none focus:ring-0 disabled:opacity-60 ${
          overflow === "auto" ? "overflow-y-auto" : "overflow-y-hidden"
        }`}
        style={{ minHeight: 48, maxHeight: MAX_HEIGHT }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="rounded-xl border border-accent/40 bg-accent/15 px-4 py-3 font-mono text-[12px] uppercase tracking-wider text-accent transition hover:bg-accent/25 disabled:opacity-50 disabled:hover:bg-accent/15"
      >
        {sendLabel}
      </button>
    </div>
  );
}
