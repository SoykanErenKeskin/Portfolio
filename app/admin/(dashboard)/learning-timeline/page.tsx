"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type LearningEntry = {
  id: string;
  toolEn: string;
  toolTr: string;
  year: number;
  level: "basic" | "intermediate" | "advanced";
  sortOrder: number;
};

const LEVELS = [
  { value: "basic" as const, label: "Basic" },
  { value: "intermediate" as const, label: "Intermediate" },
  { value: "advanced" as const, label: "Advanced" },
];

export default function AdminLearningTimelinePage() {
  const [items, setItems] = useState<LearningEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [formToolEn, setFormToolEn] = useState("");
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formLevel, setFormLevel] = useState<"basic" | "intermediate" | "advanced">("intermediate");
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/learning-timeline")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formToolEn.trim()) return;
    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/learning-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolEn: formToolEn.trim(),
          toolTr: formToolEn.trim(),
          year: formYear,
          level: formLevel,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Add failed");
      }
      setFormToolEn("");
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
          Tool names are English only (no Turkish translation).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Tool
            </label>
            <input
              type="text"
              value={formToolEn}
              onChange={(e) => setFormToolEn(e.target.value)}
              placeholder="e.g. Python"
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
            />
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
            <select
              value={formLevel}
              onChange={(e) =>
                setFormLevel(e.target.value as "basic" | "intermediate" | "advanced")
              }
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding || !formToolEn.trim()}
              className="rounded-lg bg-admin-violet px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-admin-violet/90 disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
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
              <div className="flex flex-wrap gap-3">
                {(byYear[year] ?? []).map((item) =>
                  editing === item.id ? (
                    <EditRow
                      key={item.id}
                      item={item}
                      levels={LEVELS}
                      onSave={(u) => handleSave(item.id, u)}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <div
                      key={item.id}
                      className="group flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[11px]"
                    >
                      <span className="text-ink">{item.toolEn}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                          item.level === "advanced"
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                            : item.level === "intermediate"
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                              : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {LEVELS.find((l) => l.value === item.level)?.label ?? item.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditing(item.id)}
                        className="ml-1 rounded px-2 py-0.5 font-mono text-[10px] text-ink-faint opacity-0 transition hover:bg-admin-violet/10 hover:text-admin-violet group-hover:opacity-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded px-2 py-0.5 font-mono text-[10px] text-red-600 opacity-0 transition hover:bg-red-500/10 group-hover:opacity-100 dark:text-red-400"
                      >
                        Delete
                      </button>
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
  const [toolEn, setToolEn] = useState(item.toolEn);
  const [year, setYear] = useState(item.year);
  const [level, setLevel] = useState(item.level);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave({ toolEn, toolTr: toolEn, year, level });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-admin-violet/40 bg-surface p-3"
    >
      <input
        type="text"
        value={toolEn}
        onChange={(e) => setToolEn(e.target.value)}
        placeholder="Tool"
        className="min-h-[2rem] w-24 rounded border border-border bg-surface px-2 font-mono text-[11px] text-ink"
      />
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value, 10) || item.year)}
        min={2000}
        max={2030}
        className="min-h-[2rem] w-16 rounded border border-border bg-surface px-2 font-mono text-[11px] text-ink"
      />
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value as typeof level)}
        className="min-h-[2rem] rounded border border-border bg-surface px-2 font-mono text-[11px] text-ink"
      >
        {levels.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-admin-violet px-2 py-1 font-mono text-[10px] text-white hover:bg-admin-violet/90 disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded border border-border px-2 py-1 font-mono text-[10px] text-ink-muted hover:bg-surface-raised"
      >
        Cancel
      </button>
    </form>
  );
}
