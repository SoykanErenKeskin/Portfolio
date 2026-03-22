"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ProfileData = {
  name: string;
  tagline: string;
  valueProp: string;
  supporting: string;
  email: string;
  github: string;
  linkedin: string;
  website: string;
};

export default function AdminProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Saved.");
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="font-mono text-sm text-ink-faint">Loading…</span>
      </div>
    );
  }

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
            Profile
          </h1>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            Chatbot için bio, sosyal linkler ve iletişim bilgileri.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <p
            className={`rounded-lg px-3 py-2 font-mono text-xs ${
              message.startsWith("Saved")
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {message}
          </p>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Name
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Tagline
            </label>
            <input
              type="text"
              value={data.tagline}
              onChange={(e) => setData({ ...data, tagline: e.target.value })}
              className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Value proposition (hero headline)
          </label>
          <textarea
            rows={2}
            value={data.valueProp}
            onChange={(e) => setData({ ...data, valueProp: e.target.value })}
            className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Supporting text (bio paragraph)
          </label>
          <textarea
            rows={4}
            value={data.supporting}
            onChange={(e) => setData({ ...data, supporting: e.target.value })}
            className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
            />
          </div>
          <div />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              GitHub URL
            </label>
            <input
              type="url"
              value={data.github}
              onChange={(e) => setData({ ...data, github: e.target.value })}
              className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={data.linkedin}
              onChange={(e) => setData({ ...data, linkedin: e.target.value })}
              className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Website URL
            </label>
            <input
              type="url"
              value={data.website}
              onChange={(e) => setData({ ...data, website: e.target.value })}
              className="admin-input-focus w-full rounded-lg border border-border bg-surface px-4 py-2.5 font-sans text-sm text-ink"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-admin-violet px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-admin-violet/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
