"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminChatbotPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [rules, setRules] = useState("");
  const [chatbotData, setChatbotData] = useState("");
  const [defaults, setDefaults] = useState<{
    systemPrompt: string;
    rules: string;
    chatbotData: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/chatbot", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setSystemPrompt(data.systemPrompt ?? "");
        setRules(data.rules ?? "");
        setChatbotData(data.chatbotData ?? "");
        setDefaults({
          systemPrompt: data.defaultSystemPrompt ?? "",
          rules: data.defaultRules ?? "",
          chatbotData: data.defaultChatbotData ?? "",
        });
      })
      .catch(() => {
        setSystemPrompt("");
        setRules("");
        setChatbotData("");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/chatbot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          rules: rules || null,
          chatbotData: chatbotData || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Saved.");
    } catch {
      setMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/chatbot", {
        method: "POST",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Reset failed");
      const data = await fetch("/api/admin/chatbot", { cache: "no-store" }).then(
        (r) => r.json()
      );
      setSystemPrompt(data.systemPrompt ?? "");
      setRules(data.rules ?? "");
      setChatbotData(data.chatbotData ?? "");
      setDefaults({
        systemPrompt: data.defaultSystemPrompt ?? "",
        rules: data.defaultRules ?? "",
        chatbotData: data.defaultChatbotData ?? "",
      });
      setMessage("Varsayılana sıfırlandı ve kaydedildi.");
    } catch {
      setMessage("Sıfırlama başarısız.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="font-mono text-sm text-ink-faint">Loading…</span>
      </div>
    );
  }

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
          Chatbot
        </h1>
        <p className="mt-1 font-sans text-sm text-ink-muted">
          System prompt, Rules ve Data buradan.{" "}
          <Link
            href="/admin/profile"
            className="text-admin-violet underline hover:no-underline"
          >
            Profile
          </Link>{" "}
          ve{" "}
          <Link
            href="/admin/faq"
            className="text-admin-violet underline hover:no-underline"
          >
            FAQ
          </Link>{" "}
          sayfalarından yapısal profil ve soru-cevaplar düzenlenir.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              System prompt
            </label>
            <button
              type="button"
              onClick={() => defaults && setSystemPrompt(defaults.systemPrompt)}
              disabled={!defaults}
              className="font-mono text-[10px] uppercase tracking-wider text-admin-violet transition hover:underline disabled:opacity-50"
            >
              Varsayılanı yükle
            </button>
          </div>
          <textarea
            rows={10}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant for a portfolio site. Your role is…"
            className="admin-input-focus min-h-[15rem] w-full resize-y overflow-y-auto rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-faint"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Rules (build prompt)
            </label>
            <button
              type="button"
              onClick={() => defaults && setRules(defaults.rules)}
              disabled={!defaults}
              className="font-mono text-[10px] uppercase tracking-wider text-admin-violet transition hover:underline disabled:opacity-50"
            >
              Varsayılanı yükle
            </button>
          </div>
          <textarea
            rows={22}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="LANGUAGE: Reply in the same language as the user…"
            className="admin-input-focus min-h-[20rem] w-full resize-y overflow-y-auto rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-faint"
          />
          <p className="mt-1.5 font-mono text-[10px] text-ink-faint">
            Boş bırakırsan varsayılan kurallar kullanılır.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              Data (comprehensive context)
            </label>
            <button
              type="button"
              onClick={() => defaults && setChatbotData(defaults.chatbotData)}
              disabled={!defaults}
              className="font-mono text-[10px] uppercase tracking-wider text-admin-violet transition hover:underline disabled:opacity-50"
            >
              Varsayılanı yükle
            </button>
          </div>
          <textarea
            rows={24}
            value={chatbotData}
            onChange={(e) => setChatbotData(e.target.value)}
            placeholder="## COMPREHENSIVE PROFILE&#10;..."
            className="admin-input-focus min-h-[22rem] w-full resize-y overflow-y-auto rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink-faint"
          />
          <p className="mt-1.5 font-mono text-[10px] text-ink-faint">
            Comprehensive profile, education, experience, skills vb. Profile ve
            FAQ tablolarından gelen veriler otomatik eklenir.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-admin-violet px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-admin-violet/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={saving || !defaults}
            className="rounded-lg border border-admin-violet px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-admin-violet transition hover:bg-admin-violet/10 disabled:opacity-50"
          >
            Tümünü varsayılana sıfırla ve kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
