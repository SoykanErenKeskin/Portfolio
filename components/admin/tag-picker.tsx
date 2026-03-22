"use client";

import { useState } from "react";

type TagPickerProps = {
  label: string;
  selected: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
  placeholder?: string;
};

export function TagPicker({
  label,
  selected,
  onChange,
  availableTags,
  placeholder = "Add or select…",
}: TagPickerProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || selected.includes(t)) return;
    onChange([...selected, t]);
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter((s) => s !== tag));
  };

  const suggestions = availableTags
    .filter((t) => !selected.includes(t) && t.toLowerCase().includes(input.toLowerCase().trim()))
    .slice(0, 8);

  const quickPick = availableTags.filter((t) => !selected.includes(t));

  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </label>
      {quickPick.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="w-full font-mono text-[9px] uppercase tracking-wider text-ink-faint">
            Previously used — click to add
          </span>
          {quickPick.slice(0, 24).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addTag(t)}
              className="rounded border border-border-subtle bg-surface-raised px-2 py-0.5 font-mono text-[11px] text-ink-muted transition hover:border-admin-violet/40 hover:text-admin-violet"
            >
              + {t}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-2">
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-admin-violet/15 px-2 py-0.5 font-mono text-xs text-admin-violet"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-admin-violet/80"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(input);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={placeholder}
            className="admin-input-focus min-h-[1.75rem] w-full border-0 bg-transparent px-1 py-0.5 font-mono text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          {showSuggestions &&
            (suggestions.length > 0 || input.trim() || quickPick.length > 0) && (
            <div className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-auto rounded border border-border bg-surface py-1 shadow-lg">
              {input.trim() && !availableTags.includes(input.trim()) && (
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left font-mono text-sm text-ink hover:bg-admin-violet/10"
                  onMouseDown={() => addTag(input.trim())}
                >
                  + Add &quot;{input.trim()}&quot;
                </button>
              )}
              {suggestions.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="w-full px-3 py-1.5 text-left font-mono text-sm text-ink hover:bg-admin-violet/10"
                  onMouseDown={() => addTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
