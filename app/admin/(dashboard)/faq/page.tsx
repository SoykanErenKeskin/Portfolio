"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type FaqItem = {
  id: string;
  locale: string;
  question: string;
  answer: string;
  sortOrder: number;
};

type FaqSlot = {
  sortOrder: number;
  en: FaqItem | null;
  tr: FaqItem | null;
};

export default function AdminFaqPage() {
  const [enItems, setEnItems] = useState<FaqItem[]>([]);
  const [trItems, setTrItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [adding, setAdding] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/faq?locale=en").then((r) => r.json()),
      fetch("/api/admin/faq?locale=tr").then((r) => r.json()),
    ])
      .then(([en, tr]) => {
        setEnItems(Array.isArray(en) ? en : []);
        setTrItems(Array.isArray(tr) ? tr : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const slots: FaqSlot[] = (() => {
    const orderSet = new Set<number>();
    enItems.forEach((i) => orderSet.add(i.sortOrder));
    trItems.forEach((i) => orderSet.add(i.sortOrder));
    return Array.from(orderSet)
      .sort((a, b) => a - b)
      .map((sortOrder) => ({
        sortOrder,
        en: enItems.find((i) => i.sortOrder === sortOrder) ?? null,
        tr: trItems.find((i) => i.sortOrder === sortOrder) ?? null,
      }));
  })();

  const handleAdd = async (e: React.FormEvent, andTranslate?: boolean) => {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) return;
    setAdding(true);
    setTranslateError(null);
    try {
      const allOrders = [
        ...enItems.map((i) => i.sortOrder),
        ...trItems.map((i) => i.sortOrder),
      ];
      const nextOrder = allOrders.length ? Math.max(...allOrders) + 1 : 0;

      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: "en",
          question: newQ.trim(),
          answer: newA.trim(),
          sortOrder: nextOrder,
        }),
      });
      if (!res.ok) throw new Error("Add failed");

      if (andTranslate) {
        const targetLocale = "tr";
        const from = "EN";
        const to = "TR";
        const transRes = await fetch("/api/admin/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texts: { q: newQ.trim(), a: newA.trim() },
            from,
            to,
          }),
        });
        const transJson = await transRes.json().catch(() => ({}));
        if (transRes.ok && transJson.translated) {
          await fetch("/api/admin/faq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              locale: targetLocale,
              question: transJson.translated.q ?? "",
              answer: transJson.translated.a ?? "",
              sortOrder: nextOrder,
            }),
          });
        } else {
          setTranslateError(transJson.error ?? "Çeviri başarısız.");
        }
      }

      setNewQ("");
      setNewA("");
      load();
    } catch {
      setTranslateError("Kayıt başarısız.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ item?")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    load();
  };

  const handleSave = async (
    id: string,
    updates: { question?: string; answer?: string }
  ) => {
    await fetch(`/api/admin/faq/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setEditing(null);
    load();
  };

  const handleTranslate = async (
    fromItem: FaqItem,
    toLocale: "en" | "tr"
  ) => {
    const from = fromItem.locale === "en" ? "EN" : "TR";
    const to = toLocale === "en" ? "EN" : "TR";
    setTranslating(`${fromItem.id}-${toLocale}`);
    setTranslateError(null);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: { q: fromItem.question, a: fromItem.answer },
          from,
          to,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Translation failed");

      const translated = j.translated as { q?: string; a?: string };
      const existing = toLocale === "en" ? enItems : trItems;
      const pair = existing.find((i) => i.sortOrder === fromItem.sortOrder);

      if (pair) {
        await fetch(`/api/admin/faq/${pair.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: translated.q ?? "",
            answer: translated.a ?? "",
          }),
        });
      } else {
        await fetch("/api/admin/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale: toLocale,
            question: translated.q ?? "",
            answer: translated.a ?? "",
            sortOrder: fromItem.sortOrder,
          }),
        });
      }
      load();
    } catch (e) {
      setTranslateError(e instanceof Error ? e.message : "Çeviri başarısız.");
    } finally {
      setTranslating(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet transition hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-ink">
          FAQ
        </h1>
        <p className="mt-1 font-sans text-sm text-ink-muted">
          EN ve TR versiyonları. DeepL ile çeviri yapabilirsiniz.
        </p>
      </div>

      <form
        onSubmit={(e) => handleAdd(e, false)}
        className="mb-10 rounded-xl border border-border bg-surface-raised p-6"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-violet">
          Yeni soru ekle
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Soru"
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink placeholder:text-ink-faint"
          />
          <input
            type="text"
            placeholder="Cevap"
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
            className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink placeholder:text-ink-faint"
          />
        </div>
        {translateError && (
          <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-400">
            {translateError}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={adding || !newQ.trim() || !newA.trim()}
            className="rounded-lg bg-admin-violet px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition hover:bg-admin-violet/90 disabled:opacity-50"
          >
            {adding ? "Ekleniyor…" : "Ekle"}
          </button>
          <button
            type="button"
            onClick={(e) => handleAdd(e, true)}
            disabled={adding || !newQ.trim() || !newA.trim()}
            className="rounded-lg border border-admin-violet px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-admin-violet transition hover:bg-admin-violet/10 disabled:opacity-50"
          >
            Ekle + TR çevir (DeepL)
          </button>
        </div>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-ink-faint">Yükleniyor…</p>
      ) : slots.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center font-sans text-sm text-ink-muted">
          Henüz SSS yok. Yukarıdan ekleyin.
        </p>
      ) : (
        <div className="space-y-6">
          {slots.map((slot) => (
            <div
              key={slot.sortOrder}
              className="rounded-xl border border-border bg-surface-raised p-5"
            >
              <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                #{slot.sortOrder + 1}
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <SlotCell
                  label="EN"
                  item={slot.en}
                  pairItem={slot.tr}
                  editing={editing}
                  onEdit={() => setEditing(slot.en?.id ?? null)}
                  onSave={(u) => slot.en && handleSave(slot.en.id, u)}
                  onCancel={() => setEditing(null)}
                  onDelete={() => slot.en && handleDelete(slot.en.id)}
                  onTranslateTo={() =>
                    slot.en && handleTranslate(slot.en, "tr")
                  }
                  onTranslateFrom={() =>
                    slot.tr && handleTranslate(slot.tr, "en")
                  }
                  translating={
                    slot.en
                      ? translating === `${slot.en.id}-tr`
                      : slot.tr
                        ? translating === `${slot.tr.id}-en`
                        : false
                  }
                />
                <SlotCell
                  label="TR"
                  item={slot.tr}
                  pairItem={slot.en}
                  editing={editing}
                  onEdit={() => setEditing(slot.tr?.id ?? null)}
                  onSave={(u) => slot.tr && handleSave(slot.tr.id, u)}
                  onCancel={() => setEditing(null)}
                  onDelete={() => slot.tr && handleDelete(slot.tr.id)}
                  onTranslateTo={() =>
                    slot.tr && handleTranslate(slot.tr, "en")
                  }
                  onTranslateFrom={() =>
                    slot.en && handleTranslate(slot.en, "tr")
                  }
                  translating={
                    slot.tr
                      ? translating === `${slot.tr.id}-en`
                      : slot.en
                        ? translating === `${slot.en.id}-tr`
                        : false
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SlotCell({
  label,
  item,
  pairItem,
  editing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onTranslateTo,
  onTranslateFrom,
  translating,
}: {
  label: string;
  item: FaqItem | null;
  pairItem: FaqItem | null;
  editing: string | null;
  onEdit: () => void;
  onSave: (u: { question: string; answer: string }) => void;
  onCancel: () => void;
  onDelete: () => void;
  onTranslateTo?: () => void;
  onTranslateFrom?: () => void;
  translating?: boolean;
}) {
  const otherLabel = label === "EN" ? "TR" : "EN";

  if (!item) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4">
        <span className="font-mono text-[10px] uppercase text-ink-faint">
          {label} — yok
        </span>
        {pairItem && onTranslateFrom && (
          <button
            type="button"
            onClick={onTranslateFrom}
            disabled={translating}
            className="mt-2 block font-mono text-[10px] uppercase tracking-wider text-admin-violet hover:underline disabled:opacity-50"
          >
            {translating ? "Çevriliyor…" : `${otherLabel} → ${label} çevir`}
          </button>
        )}
      </div>
    );
  }

  if (editing === item.id) {
    return (
      <div>
        <span className="font-mono text-[10px] uppercase text-admin-violet">
          {label}
        </span>
        <EditForm
          item={item}
          onSave={onSave}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase text-admin-violet">
          {label}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="font-mono text-[10px] uppercase tracking-wider text-admin-violet hover:underline"
          >
            Düzenle
          </button>
          {onTranslateTo && (
            <button
              type="button"
              onClick={onTranslateTo}
              disabled={translating}
              className="font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:underline disabled:opacity-50"
            >
              {translating ? "…" : `→ ${otherLabel} çevir`}
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline dark:text-red-400"
          >
            Sil
          </button>
        </div>
      </div>
      <p className="mt-2 font-sans font-medium text-ink">{item.question}</p>
      <p className="mt-1 font-sans text-sm text-ink-muted">{item.answer}</p>
    </div>
  );
}

function EditForm({
  item,
  onSave,
  onCancel,
}: {
  item: FaqItem;
  onSave: (u: { question: string; answer: string }) => void;
  onCancel: () => void;
}) {
  const [q, setQ] = useState(item.question);
  const [a, setA] = useState(item.answer);
  return (
    <div className="mt-3 space-y-3">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="admin-input-focus min-h-[2.75rem] w-full rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm text-ink"
      />
      <textarea
        rows={3}
        value={a}
        onChange={(e) => setA(e.target.value)}
        className="admin-input-focus min-h-[4.5rem] w-full resize-y overflow-y-auto rounded-lg border border-border bg-surface px-4 py-2 font-sans text-sm leading-relaxed text-ink"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ question: q, answer: a })}
          className="rounded-lg bg-admin-violet px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white hover:bg-admin-violet/90"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted hover:border-admin-violet/50"
        >
          İptal
        </button>
      </div>
    </div>
  );
}
