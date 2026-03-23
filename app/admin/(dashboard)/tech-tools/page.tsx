"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TechToolEntry = {
  id: string;
  key: string;
  labelEn: string;
  labelTr: string;
  type: "tech" | "tool";
  sortOrder: number;
};

type CapabilityCategory = {
  id: string;
  key: string;
  labelEn: string;
  labelTr: string;
  itemsEn: string[];
  itemsTr: string[];
};

const TYPES = [
  { value: "tech" as const, label: "Tech stack" },
  { value: "tool" as const, label: "Tools" },
];

function findCapabilityCategory(
  key: string,
  categories: CapabilityCategory[]
): string | null {
  const k = key.trim();
  for (const cat of categories) {
    const inEn = (cat.itemsEn ?? []).some((i) => (i ?? "").trim() === k);
    const inTr = (cat.itemsTr ?? []).some((i) => (i ?? "").trim() === k);
    if (inEn || inTr) return cat.labelEn || cat.key || null;
  }
  return null;
}

export default function AdminTechToolsPage() {
  const [items, setItems] = useState<TechToolEntry[]>([]);
  const [capabilityMap, setCapabilityMap] = useState<CapabilityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tech" | "tool">("tech");

  const [formKey, setFormKey] = useState("");
  const [formLabelEn, setFormLabelEn] = useState("");
  const [formLabelTr, setFormLabelTr] = useState("");
  const [formType, setFormType] = useState<"tech" | "tool">("tech");
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/tech-tools").then((r) => r.json()),
      fetch("/api/capability-map").then((r) => r.json()),
    ])
      .then(([techData, capData]) => {
        setItems(Array.isArray(techData) ? techData : []);
        setCapabilityMap(Array.isArray(capData) ? capData : []);
      })
      .catch(() => {
        setItems([]);
        setCapabilityMap([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setFormKey("");
    setFormLabelEn("");
    setFormLabelTr("");
    setFormType(activeTab);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim()) return;
    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tech-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formKey.trim(),
          labelEn: formLabelEn.trim(),
          labelTr: formLabelTr.trim(),
          type: formType,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Add failed");
      }
      resetForm();
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
    const res = await fetch(`/api/admin/tech-tools/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Delete failed.");
      return;
    }
    setEditing(null);
    setMessage("Deleted.");
    load();
  };

  const handleSave = async (
    id: string,
    updates: Partial<Pick<TechToolEntry, "key" | "labelEn" | "labelTr" | "type">>
  ) => {
    const res = await fetch(`/api/admin/tech-tools/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Save failed.");
      return;
    }
    setEditing(null);
    setMessage("Saved.");
    load();
  };

  const filteredItems = items.filter((i) => i.type === activeTab);

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
            Tech & Tools
          </h1>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            Tech/tools from published projects appear here automatically. Add TR label and save to approve — only approved items show in Learning Timeline.
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

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-surface-raised p-1">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setActiveTab(t.value);
              setFormType(t.value);
              setEditing(null);
            }}
            className={`flex-1 rounded-lg px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
              activeTab === t.value
                ? "bg-admin-violet/10 text-admin-violet"
                : "text-ink-muted hover:bg-admin-violet/10 hover:text-admin-violet"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="mb-10 rounded-xl border border-border bg-surface-raised p-5"
      >
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet">
          Add {activeTab === "tech" ? "tech" : "tool"}
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Key
            </label>
            <input
              type="text"
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              placeholder="e.g. Python, React"
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-mono text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Label (EN)
            </label>
            <input
              type="text"
              value={formLabelEn}
              onChange={(e) => setFormLabelEn(e.target.value)}
              placeholder="e.g. Python"
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Label (TR)
            </label>
            <input
              type="text"
              value={formLabelTr}
              onChange={(e) => setFormLabelTr(e.target.value)}
              placeholder="e.g. Python (opsiyonel)"
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Type
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as "tech" | "tool")}
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding || !formKey.trim()}
              className="rounded-lg bg-admin-violet/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-admin-violet transition hover:bg-admin-violet/20 disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-ink-faint">Loading…</p>
      ) : filteredItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center font-mono text-sm text-ink-faint">
          No {activeTab}s yet. Add one above.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const capCategory = findCapabilityCategory(item.key, capabilityMap);
            return editing === item.id ? (
              <div key={item.id} className="col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-5">
                <EditRow
                  item={item}
                  types={TYPES}
                  onSave={(u) => handleSave(item.id, u)}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : (
              <div
                key={item.id}
                className="group flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-4 py-4 text-center min-h-[100px]"
              >
                <div className="flex flex-col gap-1.5 min-w-0 w-full text-center">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-admin-violet break-words">
                    {item.key}
                  </span>
                  {!item.labelTr?.trim() && (
                    <span
                      className="pending-badge inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-3 py-1.5 font-sans text-[11px] font-medium text-amber-800 shadow-sm transition hover:scale-[1.02] dark:text-amber-200"
                      title="Türkçe label ekleyip kaydedin — Learning Timeline'da görünmesi için gerekli"
                    >
                      <svg
                        className="pending-icon h-3.5 w-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      Türkçe label ekle
                    </span>
                  )}
                  {capCategory && (
                    <span className="font-sans text-[10px] text-ink-muted break-words">
                      {capCategory}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded px-2 py-0.5 font-mono text-[10px] text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(item.id)}
                    className="rounded px-2 py-0.5 font-mono text-[10px] text-ink-faint transition hover:bg-admin-violet/10 hover:text-admin-violet"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EditRow({
  item,
  types,
  onSave,
  onCancel,
}: {
  item: TechToolEntry;
  types: { value: "tech" | "tool"; label: string }[];
  onSave: (u: Partial<TechToolEntry>) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState(item.key);
  const [labelEn, setLabelEn] = useState(item.labelEn);
  const [labelTr, setLabelTr] = useState(item.labelTr);
  const [type, setType] = useState<"tech" | "tool">(item.type);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave({ key, labelEn, labelTr, type });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-admin-violet/40 bg-surface-raised p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-mono text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Label (EN)
          </label>
          <input
            type="text"
            value={labelEn}
            onChange={(e) => setLabelEn(e.target.value)}
            className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Label (TR)
          </label>
          <input
            type="text"
            value={labelTr}
            onChange={(e) => setLabelTr(e.target.value)}
            className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "tech" | "tool")}
            className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-admin-violet px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white hover:bg-admin-violet/90 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted transition hover:border-admin-violet/50 hover:bg-admin-violet/10 hover:text-admin-violet"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
