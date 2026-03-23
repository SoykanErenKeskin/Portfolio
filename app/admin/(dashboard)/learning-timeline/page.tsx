"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type LearningEntry = {
  id: string;
  toolEn: string;
  toolTr: string;
  year: number;
  level: "basic" | "intermediate" | "advanced";
  sortOrder: number;
};

type TechToolItem = {
  id: string;
  key: string;
  labelEn: string;
  labelTr: string;
  type: "tech" | "tool";
};

const LEVELS = [
  { value: "basic" as const, label: "Basic" },
  { value: "intermediate" as const, label: "Intermediate" },
  { value: "advanced" as const, label: "Advanced" },
];

function LevelDropdown({
  value,
  onChange,
  levels,
  className = "",
}: {
  value: "basic" | "intermediate" | "advanced";
  onChange: (v: "basic" | "intermediate" | "advanced") => void;
  levels: typeof LEVELS;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  const current = levels.find((l) => l.value === value);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="admin-input-focus flex min-h-[2.75rem] w-full min-w-[8rem] items-center justify-between rounded-lg border border-border bg-surface px-4 py-2 text-left font-sans text-sm text-ink"
      >
        <span>{current?.label ?? value}</span>
        <span className="text-ink-faint">▼</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {levels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => {
                onChange(l.value);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left font-sans text-sm transition hover:bg-admin-violet/10 ${
                value === l.value ? "bg-admin-violet/10 text-admin-violet" : "text-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLearningTimelinePage() {
  const [items, setItems] = useState<LearningEntry[]>([]);
  const [techTools, setTechTools] = useState<TechToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [formToolKey, setFormToolKey] = useState("");
  const [formToolSearch, setFormToolSearch] = useState("");
  const [toolDropdownOpen, setToolDropdownOpen] = useState(false);
  const toolDropdownRef = useRef<HTMLDivElement>(null);
  const toolSearchInputRef = useRef<HTMLInputElement>(null);
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formLevel, setFormLevel] = useState<"basic" | "intermediate" | "advanced">("intermediate");
  const [adding, setAdding] = useState(false);

  const existingToolLevelCombo = new Set(
    items.map((i) => `${i.toolEn.trim()}|${i.level}`)
  );
  const allTechTools = techTools
    .filter((t) => t.key?.trim())
    .sort((a, b) =>
      (a.labelEn || a.key).localeCompare(b.labelEn || b.key, undefined, { sensitivity: "base" })
    );
  const searchLower = formToolSearch.trim().toLowerCase();
  let filteredTechTools = searchLower
    ? allTechTools.filter((t) => {
        const en = (t.labelEn || t.key || "").toLowerCase();
        const tr = (t.labelTr || "").toLowerCase();
        const key = (t.key || "").toLowerCase();
        return en.includes(searchLower) || tr.includes(searchLower) || key.includes(searchLower);
      })
    : allTechTools;
  const selectedTech = formToolKey
    ? techTools.find((t) => t.key.trim() === formToolKey.trim())
    : null;
  if (selectedTech && !filteredTechTools.some((t) => t.key === selectedTech.key)) {
    filteredTechTools = [selectedTech, ...filteredTechTools];
  }
  const toolEnForSelected = (selectedTech?.labelEn || selectedTech?.key || "").trim();
  const isDuplicateCombo =
    !!formToolKey &&
    !!toolEnForSelected &&
    existingToolLevelCombo.has(`${toolEnForSelected}|${formLevel}`);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/learning-timeline").then((r) => r.json()),
      fetch("/api/admin/tech-tools?approvedOnly=true").then((r) => r.json()),
    ])
      .then(([timelineData, techData]) => {
        setItems(Array.isArray(timelineData) ? timelineData : []);
        setTechTools(Array.isArray(techData) ? techData : []);
      })
      .catch(() => {
        setItems([]);
        setTechTools([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toolDropdownOpen) return;
    toolSearchInputRef.current?.focus();
    const handleClickOutside = (e: MouseEvent) => {
      if (toolDropdownRef.current && !toolDropdownRef.current.contains(e.target as Node)) {
        setToolDropdownOpen(false);
        setFormToolSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [toolDropdownOpen]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formToolKey.trim()) return;
    const selected = techTools.find((t) => t.key.trim() === formToolKey.trim());
    if (!selected) return;
    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/learning-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolEn: selected.labelEn || selected.key,
          toolTr: selected.labelTr || selected.labelEn || selected.key,
          year: formYear,
          level: formLevel,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Add failed");
      }
      setFormToolKey("");
      setFormToolSearch("");
      setToolDropdownOpen(false);
      setFormYear(new Date().getFullYear());
      setFormLevel("intermediate");
      setMessage("Added.");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Add failed.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/admin/learning-timeline/${id}`, { method: "DELETE" });
    setMessage("Deleted.");
    load();
  };

  const handleSave = async (
    id: string,
    updates: Partial<Pick<LearningEntry, "toolEn" | "toolTr" | "year" | "level">>
  ) => {
    await fetch(`/api/admin/learning-timeline/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setEditing(null);
    setMessage("Saved.");
    load();
  };

  const byYear = items.reduce<Record<number, LearningEntry[]>>((acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  }, {});

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/admin/dashboard"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet transition hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">
            Learning timeline
          </h1>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            Tech and tools with year and level. Shown below the Capability map on the home page.
          </p>
        </div>
      </div>

      {message && (
        <p
          className={`mb-6 rounded-lg px-3 py-2 font-mono text-xs ${
            message.includes("fail") || message.includes("Error")
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleAdd} className="mb-10 rounded-xl border border-border bg-surface-raised p-5">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet">
          Add entry
        </h3>
        <p className="mt-2 font-sans text-xs text-ink-faint">
          Only approved items (TR label set in Tech & Tools) appear here. Add tech/tools in published projects to create pending entries, then approve in Tech & Tools.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div ref={toolDropdownRef} className="relative sm:col-span-2">
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Tech / Tool
            </label>
            <button
              type="button"
              onClick={() => setToolDropdownOpen((o) => !o)}
              className="admin-input-focus flex min-h-[2.75rem] w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-2 text-left font-sans text-sm text-ink"
            >
              <span className={formToolKey ? "text-ink" : "text-ink-faint"}>
                {selectedTech ? selectedTech.labelEn || selectedTech.key : "Select…"}
              </span>
              <span className="text-ink-faint">▼</span>
            </button>
            {toolDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[16rem] overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                <input
                  ref={toolSearchInputRef}
                  type="text"
                  value={formToolSearch}
                  onChange={(e) => setFormToolSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Search…"
                  className="w-full border-b border-border bg-transparent px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-0"
                />
                <div className="max-h-[12rem] overflow-y-auto py-1">
                  {allTechTools.length === 0 ? (
                    <p className="px-3 py-2 font-sans text-sm text-ink-faint">
                      No tech & tools
                    </p>
                  ) : filteredTechTools.length === 0 ? (
                    <p className="px-3 py-2 font-sans text-sm text-ink-faint">
                      No matches
                    </p>
                  ) : (
                    filteredTechTools.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setFormToolKey(t.key);
                          setFormToolSearch("");
                          setToolDropdownOpen(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left font-sans text-sm hover:bg-admin-violet/10 ${
                          formToolKey === t.key ? "bg-admin-violet/10 text-admin-violet" : "text-ink"
                        }`}
                      >
                        {t.labelEn || t.key}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Year
            </label>
            <input
              type="number"
              value={formYear}
              onChange={(e) => setFormYear(parseInt(e.target.value, 10) || new Date().getFullYear())}
              min={2000}
              max={2030}
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Level
            </label>
            <LevelDropdown
              value={formLevel}
              onChange={setFormLevel}
              levels={LEVELS}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={
                adding ||
                !formToolKey.trim() ||
                allTechTools.length === 0 ||
                isDuplicateCombo
              }
              className="rounded-lg bg-admin-violet/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-admin-violet transition hover:bg-admin-violet/20 disabled:opacity-50"
            >
              {adding ? "Adding…" : isDuplicateCombo ? "Already exists" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-ink-faint">Loading…</p>
      ) : years.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center font-mono text-sm text-ink-faint">
          No entries yet. Add one above.
        </p>
      ) : (
        <div className="space-y-6">
          {years.map((year) => (
            <div key={year} className="rounded-xl border border-border bg-surface-raised p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-admin-violet">
                  {year}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {(byYear[year] ?? []).map((item) =>
                  editing === item.id ? (
                    <div key={item.id} className="col-span-2 sm:col-span-3 md:col-span-4">
                      <EditRow
                      key={item.id}
                      item={item}
                      levels={LEVELS}
                      onSave={(u) => handleSave(item.id, u)}
                      onCancel={() => setEditing(null)}
                    />
                    </div>
                  ) : (
                    <div
                      key={item.id}
                      className="group flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-admin-violet/30 hover:bg-surface-raised"
                    >
                      <p className="min-h-[2rem] break-words font-mono text-[12px] font-medium leading-snug text-ink">
                        {item.toolEn}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] ${
                            item.level === "advanced"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : item.level === "intermediate"
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {LEVELS.find((l) => l.value === item.level)?.label ?? item.level}
                        </span>
                        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => setEditing(item.id)}
                            className="rounded px-2 py-1 font-mono text-[10px] text-ink-faint hover:bg-admin-violet/10 hover:text-admin-violet"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded px-2 py-1 font-mono text-[10px] text-red-600 hover:bg-red-500/10 dark:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditRow({
  item,
  levels,
  onSave,
  onCancel,
}: {
  item: LearningEntry;
  levels: { value: "basic" | "intermediate" | "advanced"; label: string }[];
  onSave: (u: Partial<LearningEntry>) => void;
  onCancel: () => void;
}) {
  const [year, setYear] = useState(item.year);
  const [level, setLevel] = useState(item.level);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave({ year, level });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-4 rounded-xl border border-admin-violet/40 bg-surface p-4"
    >
      <span className="font-mono text-[12px] font-medium text-ink">
        {item.toolEn}
      </span>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value, 10) || item.year)}
        min={2000}
        max={2030}
        placeholder="Year"
        title="Year"
        className="min-h-[2.25rem] w-24 rounded-lg border border-border bg-surface px-3 pr-8 font-mono text-[12px] text-ink"
      />
      <LevelDropdown
        value={level}
        onChange={setLevel}
        levels={levels}
        className="w-36"
      />
      <div className="flex shrink-0 gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-admin-violet px-4 py-1.5 font-mono text-[11px] text-white hover:bg-admin-violet/90 disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-1.5 font-mono text-[11px] text-ink-muted transition hover:bg-admin-violet/10 hover:text-admin-violet"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
