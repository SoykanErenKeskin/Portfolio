"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CapabilityCategory = {
  id: string;
  key: string;
  labelEn: string;
  labelTr: string;
  itemsEn: string[];
  itemsTr: string[];
  sortOrder: number;
};

export default function AdminCapabilityMapPage() {
  const [items, setItems] = useState<CapabilityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [formKey, setFormKey] = useState("");
  const [formLabelEn, setFormLabelEn] = useState("");
  const [formLabelTr, setFormLabelTr] = useState("");
  const [formItemsEn, setFormItemsEn] = useState<string[]>([]);
  const [formItemsTr, setFormItemsTr] = useState<string[]>([]);
  const [formNewItemEn, setFormNewItemEn] = useState("");
  const [formNewItemTr, setFormNewItemTr] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/capability-map")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setFormKey("");
    setFormLabelEn("");
    setFormLabelTr("");
    setFormItemsEn([]);
    setFormItemsTr([]);
    setFormNewItemEn("");
    setFormNewItemTr("");
    setAdding(false);
    setEditing(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim()) return;
    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/capability-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formKey.trim(),
          labelEn: formLabelEn.trim(),
          labelTr: formLabelTr.trim(),
          itemsEn: formItemsEn,
          itemsTr: formItemsTr,
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
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/capability-map/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Delete failed.");
      return;
    }
    resetForm();
    setMessage("Deleted.");
    load();
  };

  const handleSave = async (
    id: string,
    updates: Partial<Pick<CapabilityCategory, "key" | "labelEn" | "labelTr" | "itemsEn" | "itemsTr">>
  ) => {
    const res = await fetch(`/api/admin/capability-map/${id}`, {
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

  const addItemToForm = (lang: "en" | "tr") => {
    const v = (lang === "en" ? formNewItemEn : formNewItemTr).trim();
    const setter = lang === "en" ? setFormItemsEn : setFormItemsTr;
    const items = lang === "en" ? formItemsEn : formItemsTr;
    if (v && !items.includes(v)) {
      setter([...items, v]);
      if (lang === "en") setFormNewItemEn("");
      else setFormNewItemTr("");
    }
  };

  const removeItemFromForm = (lang: "en" | "tr", idx: number) => {
    if (lang === "en") setFormItemsEn(formItemsEn.filter((_, i) => i !== idx));
    else setFormItemsTr(formItemsTr.filter((_, i) => i !== idx));
  };

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
            Capability map
          </h1>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            Categories with key, labels (EN/TR), and items. Shown on the home page above Learning timeline.
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

      <form
        onSubmit={handleAdd}
        className="mb-10 rounded-xl border border-border bg-surface-raised p-5"
      >
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet">
          Add category
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Key
            </label>
            <input
              type="text"
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              placeholder="e.g. analytics"
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
              placeholder="e.g. Data analytics"
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
              placeholder="e.g. Veri analitiği"
              className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
            />
          </div>
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Items (EN)
            </label>
            <div className="flex flex-wrap gap-2">
              {formItemsEn.map((it, i) => (
                <span
                  key={`en-${it}-${i}`}
                  className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 font-mono text-[11px] text-ink"
                >
                  {it}
                  <button
                    type="button"
                    onClick={() => removeItemFromForm("en", i)}
                    className="rounded p-0.5 text-ink-faint hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex gap-1">
                <input
                  type="text"
                  value={formNewItemEn}
                  onChange={(e) => setFormNewItemEn(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItemToForm("en"))}
                  placeholder="Add EN item…"
                  className="admin-input-focus min-h-[2rem] w-32 rounded border border-border bg-surface px-2 font-mono text-[11px] text-ink"
                />
                <button
                  type="button"
                  onClick={() => addItemToForm("en")}
                  className="rounded border border-border px-2 py-1 font-mono text-[10px] text-ink-muted transition hover:bg-admin-violet/10 hover:text-admin-violet"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Items (TR)
            </label>
            <div className="flex flex-wrap gap-2">
              {formItemsTr.map((it, i) => (
                <span
                  key={`tr-${it}-${i}`}
                  className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 font-mono text-[11px] text-ink"
                >
                  {it}
                  <button
                    type="button"
                    onClick={() => removeItemFromForm("tr", i)}
                    className="rounded p-0.5 text-ink-faint hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex gap-1">
                <input
                  type="text"
                  value={formNewItemTr}
                  onChange={(e) => setFormNewItemTr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItemToForm("tr"))}
                  placeholder="Add TR item…"
                  className="admin-input-focus min-h-[2rem] w-32 rounded border border-border bg-surface px-2 font-mono text-[11px] text-ink"
                />
                <button
                  type="button"
                  onClick={() => addItemToForm("tr")}
                  className="rounded border border-border px-2 py-1 font-mono text-[10px] text-ink-muted transition hover:bg-admin-violet/10 hover:text-admin-violet"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={adding || !formKey.trim()}
            className="rounded-lg bg-admin-violet px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-admin-violet/90 disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add category"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-ink-faint">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center font-mono text-sm text-ink-faint">
          No categories yet. Add one above.
        </p>
      ) : (
        <div className="space-y-6">
          {items.map((cat) =>
            editing === cat.id ? (
              <EditCategoryRow
                key={cat.id}
                cat={cat}
                onSave={(u) => handleSave(cat.id, u)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div
                key={cat.id}
                className="rounded-xl border border-border bg-surface-raised p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-admin-violet">
                    {cat.key}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(cat.id)}
                      className="rounded px-2 py-0.5 font-mono text-[10px] text-ink-faint transition hover:bg-admin-violet/10 hover:text-admin-violet"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="rounded px-2 py-0.5 font-mono text-[10px] text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="font-sans text-sm text-ink">
                  EN: {cat.labelEn || "(empty)"} · TR: {cat.labelTr || "(empty)"}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="font-mono text-[11px] text-ink-muted">
                    EN: {cat.itemsEn.length === 0 ? "—" : cat.itemsEn.map((it, i) => (
                      <span key={`${it}-${i}`} className="mr-1.5 rounded bg-surface px-1 py-0.5">{it}</span>
                    ))}
                  </div>
                  <div className="font-mono text-[11px] text-ink-muted">
                    TR: {cat.itemsTr.length === 0 ? "—" : cat.itemsTr.map((it, i) => (
                      <span key={`${it}-${i}`} className="mr-1.5 rounded bg-surface px-1 py-0.5">{it}</span>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function EditCategoryRow({
  cat,
  onSave,
  onCancel,
}: {
  cat: CapabilityCategory;
  onSave: (u: Partial<CapabilityCategory>) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState(cat.key);
  const [labelEn, setLabelEn] = useState(cat.labelEn);
  const [labelTr, setLabelTr] = useState(cat.labelTr);
  const [itemsEn, setItemsEn] = useState<string[]>(cat.itemsEn);
  const [itemsTr, setItemsTr] = useState<string[]>(cat.itemsTr);
  const [newItemEn, setNewItemEn] = useState("");
  const [newItemTr, setNewItemTr] = useState("");
  const [saving, setSaving] = useState(false);

  const addItem = (lang: "en" | "tr") => {
    const v = (lang === "en" ? newItemEn : newItemTr).trim();
    const setter = lang === "en" ? setItemsEn : setItemsTr;
    const items = lang === "en" ? itemsEn : itemsTr;
    if (v && !items.includes(v)) {
      setter([...items, v]);
      if (lang === "en") setNewItemEn("");
      else setNewItemTr("");
    }
  };

  const removeItem = (lang: "en" | "tr", idx: number) => {
    if (lang === "en") setItemsEn(itemsEn.filter((_, i) => i !== idx));
    else setItemsTr(itemsTr.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave({ key, labelEn, labelTr, itemsEn, itemsTr });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-admin-violet/40 bg-surface-raised p-5"
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
      <div className="mb-4 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Items (EN)
          </label>
          <div className="flex flex-wrap gap-2">
            {itemsEn.map((it, i) => (
              <span
                key={`en-${it}-${i}`}
                className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 font-mono text-[11px] text-ink"
              >
                {it}
                <button
                  type="button"
                  onClick={() => removeItem("en", i)}
                  className="rounded p-0.5 text-ink-faint hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400"
                  aria-label="Remove"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="flex gap-1">
              <input
                type="text"
                value={newItemEn}
                onChange={(e) => setNewItemEn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("en"))}
                placeholder="Add EN item…"
                className="admin-input-focus min-h-[2rem] w-32 rounded border border-border bg-surface px-2 font-mono text-[11px] text-ink"
              />
              <button
                type="button"
                onClick={() => addItem("en")}
                className="rounded border border-border px-2 py-1 font-mono text-[10px] text-ink-muted transition hover:bg-admin-violet/10 hover:text-admin-violet"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Items (TR)
          </label>
          <div className="flex flex-wrap gap-2">
            {itemsTr.map((it, i) => (
              <span
                key={`tr-${it}-${i}`}
                className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 font-mono text-[11px] text-ink"
              >
                {it}
                <button
                  type="button"
                  onClick={() => removeItem("tr", i)}
                  className="rounded p-0.5 text-ink-faint hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400"
                  aria-label="Remove"
                >
                  ×
                </button>
              </span>
            ))}
            <div className="flex gap-1">
              <input
                type="text"
                value={newItemTr}
                onChange={(e) => setNewItemTr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("tr"))}
                placeholder="Add TR item…"
                className="admin-input-focus min-h-[2rem] w-32 rounded border border-border bg-surface px-2 font-mono text-[11px] text-ink"
              />
              <button
                type="button"
                onClick={() => addItem("tr")}
                className="rounded border border-border px-2 py-1 font-mono text-[10px] text-ink-muted transition hover:bg-admin-violet/10 hover:text-admin-violet"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
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
    </form>
  );
}
