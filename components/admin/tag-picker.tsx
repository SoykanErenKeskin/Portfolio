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

  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </label>
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
            className="admin-input-focus w-full border-0 bg-transparent px-1 py-0.5 font-mono text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          {showSuggestions && (suggestions.length > 0 || input.trim()) && (
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
