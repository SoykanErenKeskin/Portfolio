"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProjectRecord } from "@/types/project";
import { cn } from "@/lib/utils";
import { TagPicker } from "./tag-picker";

type FormData = {
  slug: string;
  date: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  title: { en: string; tr: string };
  shortDescription: { en: string; tr: string };
  summary: { en: string; tr: string };
  domain: { en: string; tr: string };
  focus: { en: string; tr: string };
  problem: { en: string; tr: string };
  approach: { en: string; tr: string };
  outcome: { en: string; tr: string };
  tech: string[];
  tools: string[];
  images: { src: string; alt: { en: string; tr: string }; type?: "image" | "video" }[];
  links: { github?: string; live?: string; videoUrl?: string };
};

const localizedKeys = [
  "title",
  "shortDescription",
  "summary",
  "domain",
  "focus",
  "problem",
  "approach",
  "outcome",
] as const;

const placeholders: Record<(typeof localizedKeys)[number], string> = {
  title: "e.g. Order & Operational Tracking System — Project name, short and clear",
  shortDescription: "e.g. A logistics app for warehouse-to-delivery tracking — 1–2 sentence summary shown in project list",
  summary: "e.g. Full-stack mobile and backend system for real-time order and route management — Overview of what it does and who it's for",
  domain: "e.g. Logistics, Operations — Domain / sector (optional)",
  focus: "e.g. Real-time tracking, Role-based dashboards — Main focus areas, key features",
  problem: "e.g. Manual order and route tracking led to errors and delays — The problem or need being solved",
  approach: "e.g. React Native for mobile, Supabase backend, role-based access — Method used, architectural decisions",
  outcome: "e.g. Improved operational visibility, reduced error rate — Results and learnings",
};

/** Rows sized so full placeholder is visible on narrow screens (wrapped text). */
const placeholderRows: Record<(typeof localizedKeys)[number], number> = {
  title: 3,
  shortDescription: 4,
  summary: 7,
  domain: 3,
  focus: 3,
  problem: 7,
  approach: 7,
  outcome: 4,
};

/** Extra min-height so wrapped placeholders don’t clip (mobile). */
const placeholderMinHeights: Partial<Record<(typeof localizedKeys)[number], string>> = {
  summary: "min-h-[11rem]",
  problem: "min-h-[11rem]",
  approach: "min-h-[11rem]",
  shortDescription: "min-h-[6rem]",
  title: "min-h-[4.5rem]",
  outcome: "min-h-[6rem]",
};

const emptyForm: FormData = {
  slug: "",
  date: new Date().toISOString().slice(0, 10),
  status: "DRAFT",
  featured: false,
  title: { en: "", tr: "" },
  shortDescription: { en: "", tr: "" },
  summary: { en: "", tr: "" },
  domain: { en: "", tr: "" },
  focus: { en: "", tr: "" },
  problem: { en: "", tr: "" },
  approach: { en: "", tr: "" },
  outcome: { en: "", tr: "" },
  tech: [],
  tools: [],
  images: [],
  links: {},
};

function projectToForm(p: ProjectRecord & { publishStatus?: "DRAFT" | "PUBLISHED" }): FormData {
  return {
    slug: p.slug ?? p.id,
    date: p.date,
    status: p.publishStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    featured: p.featured ?? false,
    title: p.title ?? { en: "", tr: "" },
    shortDescription: p.shortDescription ?? { en: "", tr: "" },
    summary: p.summary ?? { en: "", tr: "" },
    domain: p.domain ?? { en: "", tr: "" },
    focus: p.focus ?? { en: "", tr: "" },
    problem: p.problem ?? { en: "", tr: "" },
    approach: p.approach ?? { en: "", tr: "" },
    outcome: p.outcome ?? { en: "", tr: "" },
    tech: p.tech ?? [],
    tools: p.tools ?? [],
    images:
      p.images?.map((img) => ({
        src: img.src,
        alt: img.alt ?? { en: "", tr: "" },
        type: img.type as "image" | "video",
      })) ?? [],
    links: p.links ?? {},
  };
}

export function ProjectForm({
  projectId,
  initialData,
}: {
  projectId: string | null;
  initialData?: (ProjectRecord & { publishStatus?: "DRAFT" | "PUBLISHED" }) | null;
}) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<"en" | "tr">("en");
  const [data, setData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTech, setAvailableTech] = useState<string[]>([]);
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [translating, setTranslating] = useState<string | null>(null);

  const isEdit = !!projectId;

  const translateField = async (
    key: (typeof localizedKeys)[number],
    from: "en" | "tr",
    to: "en" | "tr"
  ) => {
    const src = (data[key] as { en: string; tr: string })[from]?.trim();
    if (!src) return;
    setTranslating(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: src,
          from: from === "en" ? "EN" : "TR",
          to: to === "en" ? "EN" : "TR",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Translation failed");
      updateLocale(key, to, j.translated ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çeviri başarısız");
    } finally {
      setTranslating(null);
    }
  };

  const translateAll = async (from: "en" | "tr", to: "en" | "tr") => {
    const texts: Record<string, string> = {};
    for (const key of localizedKeys) {
      const src = (data[key] as { en: string; tr: string })[from]?.trim();
      if (src) texts[key] = src;
    }
    if (Object.keys(texts).length === 0) return;
    setTranslating("_all");
    setError(null);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts,
          from: from === "en" ? "EN" : "TR",
          to: to === "en" ? "EN" : "TR",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Translation failed");
      const translated = j.translated as Record<string, string> | undefined;
      if (translated) {
        const updates: Partial<FormData> = {};
        for (const key of localizedKeys) {
          if (translated[key]) {
            (updates[key] as Record<string, string>) = {
              ...(data[key] as { en: string; tr: string }),
              [to]: translated[key],
            };
          }
        }
        if (Object.keys(updates).length > 0) {
          setData((prev) => ({ ...prev, ...updates }));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çeviri başarısız");
    } finally {
      setTranslating(null);
    }
  };

  useEffect(() => {
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then((j: { tech?: string[]; tools?: string[] }) => {
        setAvailableTech(j.tech ?? []);
        setAvailableTools(j.tools ?? []);
      })
      .catch(() => {});
  }, []);

  /** Folder name for uploads: DB id when editing, slug when creating */
  const uploadFolderId =
    isEdit && projectId
      ? projectId
      : data.slug.trim().replace(/[^a-z0-9-]/gi, "").toLowerCase().slice(0, 100);

  const slugForValidation = data.slug.trim().toLowerCase();
  const canUploadFiles =
    Boolean(uploadFolderId) &&
    (isEdit || (/^[a-z0-9-]+$/.test(slugForValidation) && slugForValidation.length >= 1));

  useEffect(() => {
    if (initialData) {
      setData(projectToForm(initialData));
    } else if (!isEdit) {
      setData(emptyForm);
    }
  }, [initialData, isEdit]);

  const update = (updates: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const updateLocale = (key: keyof FormData, locale: "en" | "tr", value: string) => {
    if (key !== "title" && key !== "shortDescription" && key !== "summary" &&
        key !== "domain" && key !== "focus" && key !== "problem" && key !== "approach" && key !== "outcome") return;
    setData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as { en: string; tr: string }), [locale]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...data,
        domain: data.domain.en || data.domain.tr ? data.domain : undefined,
        focus: data.focus.en || data.focus.tr ? data.focus : undefined,
        links: Object.fromEntries(
          Object.entries(data.links).filter(([, v]) => v && String(v).trim())
        ) as { github?: string; live?: string; videoUrl?: string },
      };

      const url = isEdit ? `/api/admin/projects/${projectId}` : "/api/admin/projects";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to save");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="border border-red-500/40 bg-surface-raised p-4 font-mono text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="panel-edge rounded-lg border border-border bg-surface-raised p-6">
        <h2 className="mb-4 font-mono text-sm font-medium text-ink">
          Basic info
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Slug
            </label>
            <textarea
              value={data.slug}
              onChange={(e) =>
                update({
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                })
              }
              placeholder="order-tracking-app — lowercase, hyphens; used in URL"
              required
              rows={3}
              disabled={isEdit}
              className="admin-input-focus min-h-[4.5rem] w-full resize-y overflow-y-auto border border-border bg-surface px-3 py-2 font-sans text-sm leading-relaxed text-ink placeholder:text-ink-faint"
            />
            {isEdit && (
              <p className="mt-1 font-mono text-[10px] text-ink-muted">Slug cannot be changed after creation.</p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Date
            </label>
            <input
              type="date"
              value={data.date}
              onChange={(e) => update({ date: e.target.value })}
              required
              className="admin-input-focus w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
            />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                Status
              </span>
              <div className="flex gap-2">
                <label
                  className={cn(
                    "flex w-28 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition",
                    data.status === "DRAFT"
                      ? "border-admin-violet bg-admin-violet/10 text-admin-violet"
                      : "border-border text-ink-muted hover:border-admin-violet/40 hover:text-ink"
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={data.status === "DRAFT"}
                    onChange={() => update({ status: "DRAFT" })}
                    className="sr-only"
                  />
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-current">
                    {data.status === "DRAFT" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  Draft
                </label>
                <label
                  className={cn(
                    "flex w-28 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition",
                    data.status === "PUBLISHED"
                      ? "border-admin-violet bg-admin-violet/10 text-admin-violet"
                      : "border-border text-ink-muted hover:border-admin-violet/40 hover:text-ink"
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={data.status === "PUBLISHED"}
                    onChange={() => update({ status: "PUBLISHED" })}
                    className="sr-only"
                  />
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-current">
                    {data.status === "PUBLISHED" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  Published
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-border-subtle pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                Display
              </span>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border py-1.5 pl-2 pr-3 font-sans text-sm transition",
                  data.featured
                    ? "border-admin-violet bg-admin-violet/10 text-admin-violet"
                    : "border-border text-ink-muted hover:border-admin-violet/40 hover:text-ink"
                )}
              >
                <input
                  type="checkbox"
                  checked={data.featured}
                  onChange={(e) => update({ featured: e.target.checked })}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition",
                    data.featured ? "border-current bg-current" : "border-current"
                  )}
                >
                  {data.featured && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                Featured
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Localized content */}
      <section className="panel-edge rounded-lg border border-border bg-surface-raised p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveLocale("en")}
            className={`rounded px-3 py-1 font-mono text-sm ${activeLocale === "en" ? "border border-border bg-surface text-ink" : "text-ink-muted"}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setActiveLocale("tr")}
            className={`rounded px-3 py-1 font-mono text-sm ${activeLocale === "tr" ? "border border-border bg-surface text-ink" : "text-ink-muted"}`}
          >
            TR
          </button>
          {activeLocale === "tr" && (
            <button
              type="button"
              onClick={() => translateAll("tr", "en")}
              disabled={
                translating === "_all" ||
                !localizedKeys.some((k) => (data[k] as { tr: string }).tr?.trim())
              }
              className="rounded border border-admin-violet/50 px-3 py-1 font-mono text-[11px] text-admin-violet transition hover:bg-admin-violet/10 disabled:opacity-50"
            >
              {translating === "_all" ? "Çevriliyor…" : "Tümünü EN'e çevir"}
            </button>
          )}
          {activeLocale === "en" && (
            <button
              type="button"
              onClick={() => translateAll("en", "tr")}
              disabled={
                translating === "_all" ||
                !localizedKeys.some((k) => (data[k] as { en: string }).en?.trim())
              }
              className="rounded border border-admin-violet/50 px-3 py-1 font-mono text-[11px] text-admin-violet transition hover:bg-admin-violet/10 disabled:opacity-50"
            >
              {translating === "_all" ? "Çevriliyor…" : "Tümünü TR'ye çevir"}
            </button>
          )}
        </div>
        <div className="space-y-4">
          {localizedKeys.map((key) => (
            <div key={key} className="flex gap-2">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </label>
                <textarea
                  value={(data[key] as { en: string; tr: string })[activeLocale]}
                  onChange={(e) => updateLocale(key, activeLocale, e.target.value)}
                  placeholder={placeholders[key]}
                  rows={placeholderRows[key]}
                  className={cn(
                    "admin-input-focus w-full resize-y overflow-y-auto border border-border bg-surface px-3 py-2 font-sans text-sm leading-relaxed text-ink placeholder:text-ink-faint",
                    placeholderMinHeights[key]
                  )}
                />
              </div>
              <div className="hidden shrink-0 flex-col justify-end pb-1 md:flex">
                {activeLocale === "tr" ? (
                  <button
                    type="button"
                    onClick={() => translateField(key, "tr", "en")}
                    disabled={
                      translating !== null || !(data[key] as { tr: string }).tr?.trim()
                    }
                    title="TR → EN çevir"
                    className="rounded border border-border-subtle px-2 py-1.5 font-mono text-[10px] text-ink-muted transition hover:border-admin-violet/40 hover:text-admin-violet disabled:opacity-50"
                  >
                    {translating === key ? "…" : "TR→EN"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => translateField(key, "en", "tr")}
                    disabled={
                      translating !== null || !(data[key] as { en: string }).en?.trim()
                    }
                    title="EN → TR çevir"
                    className="rounded border border-border-subtle px-2 py-1.5 font-mono text-[10px] text-ink-muted transition hover:border-admin-violet/40 hover:text-admin-violet disabled:opacity-50"
                  >
                    {translating === key ? "…" : "EN→TR"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech & tools */}
      <section className="panel-edge rounded-lg border border-border bg-surface-raised p-6">
        <h2 className="mb-4 font-mono text-sm font-medium text-ink">
          Tech & tools
        </h2>
        <div className="space-y-4">
          <TagPicker
            label="Tech tags"
            selected={data.tech}
            onChange={(tech) => update({ tech })}
            availableTags={availableTech}
            placeholder="Select or type to add…"
          />
          <TagPicker
            label="Tools"
            selected={data.tools}
            onChange={(tools) => update({ tools })}
            availableTags={availableTools}
            placeholder="Select or type to add…"
          />
        </div>
      </section>

      {/* Links */}
      <section className="panel-edge rounded-lg border border-border bg-surface-raised p-6">
        <h2 className="mb-4 font-mono text-sm font-medium text-ink">
          Links
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              GitHub
            </label>
            <textarea
              value={data.links?.github ?? ""}
              onChange={(e) =>
                update({ links: { ...data.links, github: e.target.value.trim() || undefined } })
              }
              placeholder="https://github.com/user/repo — Repository link (optional)"
              rows={2}
              className="admin-input-focus min-h-[3.5rem] w-full resize-none border border-border bg-surface px-3 py-2 font-sans text-sm leading-relaxed text-ink placeholder:text-ink-faint"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Live / Demo
            </label>
            <textarea
              value={data.links?.live ?? ""}
              onChange={(e) =>
                update({ links: { ...data.links, live: e.target.value.trim() || undefined } })
              }
              placeholder="https://demo.example.com — Live site or demo link (optional)"
              rows={2}
              className="admin-input-focus min-h-[3.5rem] w-full resize-none border border-border bg-surface px-3 py-2 font-sans text-sm leading-relaxed text-ink placeholder:text-ink-faint"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Video URL (optional)
            </label>
            <textarea
              value={data.links?.videoUrl ?? ""}
              onChange={(e) =>
                update({ links: { ...data.links, videoUrl: e.target.value.trim() || undefined } })
              }
              placeholder="https://youtube.com/watch?v=... — Intro video (optional)"
              rows={2}
              className="admin-input-focus min-h-[3.5rem] w-full resize-none border border-border bg-surface px-3 py-2 font-sans text-sm leading-relaxed text-ink placeholder:text-ink-faint"
            />
          </div>
        </div>
      </section>

      {/* Images - simplified: allow adding URLs or use upload component */}
      <section className="panel-edge rounded-lg border border-border bg-surface-raised p-6">
        <h2 className="mb-4 font-mono text-sm font-medium text-ink">
          Görseller / Images
        </h2>
        <p className="mb-4 text-xs text-ink-muted">
          <span className="block">
            Dosya yükleyebilir veya görsel URL&apos;si ekleyebilirsiniz. Yeni projede önce üstteki{" "}
            <strong>Slug</strong> alanını doldurun (ör. <code className="rounded border border-border-subtle bg-surface px-1 font-mono text-[10px]">my-project</code>
            ), sonra fotoğraf yükleyin.
          </span>
          <span className="mt-1 block">
            You can upload files or paste image URLs. For a new project, set the <strong>Slug</strong> first, then
            upload photos.
          </span>
        </p>
        <ImageList
          images={data.images}
          uploadFolderId={uploadFolderId}
          canUpload={canUploadFiles}
          onChange={(images) => update({ images })}
        />
      </section>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="border border-border bg-surface-raised px-6 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition hover:border-admin-violet/40 hover:text-admin-violet disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update project" : "Create project"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-border-subtle px-6 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted transition hover:border-admin-violet/40 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddImageInput({
  onAdd,
}: {
  onAdd: (src: string, alt?: { en: string; tr: string }, type?: "image" | "video") => void;
}) {
  const [value, setValue] = useState("");
  const submit = () => {
    const v = value.trim();
    if (v) {
      onAdd(v, { en: "", tr: "" }, v.match(/\.(mp4|webm)(\?|$)/i) ? "video" : "image");
      setValue("");
    }
  };
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\n/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="https://... — Paste image or video URL"
        rows={2}
        className="admin-input-focus min-h-[3.5rem] min-w-[200px] flex-1 resize-none border border-border bg-surface px-3 py-2 font-sans text-sm leading-relaxed text-ink placeholder:text-ink-faint"
      />
      <button type="button" onClick={submit} className="shrink-0 border border-border bg-surface-raised px-4 py-2 font-mono text-sm text-ink transition hover:border-admin-violet/40">
        Add URL
      </button>
    </div>
  );
}

function ImageList({
  images,
  uploadFolderId,
  canUpload,
  onChange,
}: {
  images: FormData["images"];
  uploadFolderId: string;
  canUpload: boolean;
  onChange: (images: FormData["images"]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [thumbLoadFailed, setThumbLoadFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!lightboxSrc) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxSrc]);

  const addImage = (src: string, alt = { en: "", tr: "" }, type: "image" | "video" = "image") => {
    if (!src.trim()) return;
    onChange([...images, { src: src.trim(), alt, type }]);
  };

  const removeImage = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const n = images.length;
    const j = Math.max(0, Math.min(n - 1, i + dir));
    if (i === j) return;
    const next = [...images];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => {
      if (f.type.startsWith("image/")) return true;
      return /\.(jpe?g|png|gif|webp|svg|heic|heif)$/i.test(f.name);
    });
    if (list.length === 0 || !canUpload || !uploadFolderId) return;
    setUploading(true);
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("projectId", uploadFolderId);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
          credentials: "same-origin",
        });
        const text = await res.text();
        let json: { src?: string; error?: string } = {};
        try {
          json = text ? (JSON.parse(text) as typeof json) : {};
        } catch {
          alert(
            `Yükleme başarısız / Upload failed (${res.status}): ${text.slice(0, 200)}`
          );
          continue;
        }
        if (res.ok && json.src) {
          addImage(json.src);
        } else {
          alert(json.error ?? `Yükleme başarısız / Upload failed: ${file.name}`);
        }
      }
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Yükleme hatası / Upload error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    await uploadFiles(files);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!canUpload) return;
    await uploadFiles(e.dataTransfer.files);
  };

  const isVideoEntry = (img: FormData["images"][number]) =>
    img.type === "video" || /\.(mp4|webm)(\?|$)/i.test(img.src);

  return (
    <div className="space-y-4">
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded border border-white/20 bg-surface/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink shadow-lg transition hover:bg-surface"
            onClick={() => setLightboxSrc(null)}
          >
            Kapat / Close
          </button>
          <a
            href={lightboxSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-4 top-4 rounded border border-white/20 bg-surface/90 px-3 py-1.5 font-mono text-[11px] text-admin-violet shadow-lg transition hover:bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            Yeni sekmede aç / Open
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[min(90vh,900px)] max-w-[min(96vw,1200px)] rounded border border-border-subtle object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {images.map((img, i) => (
        <div key={i} className="flex flex-col gap-3 border border-border bg-surface p-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:max-w-[240px]">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border-subtle bg-surface-raised sm:w-[220px]">
              {isVideoEntry(img) ? (
                <div className="flex h-full min-h-[120px] items-center justify-center font-mono text-xs text-ink-muted">
                  Video
                </div>
              ) : thumbLoadFailed[i] ? (
                <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 p-2 text-center font-mono text-[10px] text-ink-muted">
                  Önizleme yüklenemedi
                  <a
                    href={img.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-admin-violet underline"
                  >
                    URL&apos;yi aç
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLightboxSrc(img.src)}
                  className="group relative h-full w-full min-h-[120px]"
                  title="Tam boyut önizle / Full preview"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt=""
                    className="h-full w-full object-contain transition group-hover:opacity-95"
                    loading="lazy"
                    onError={() =>
                      setThumbLoadFailed((prev) => ({ ...prev, [i]: true }))
                    }
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                    <span className="rounded bg-surface/95 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink opacity-0 shadow group-hover:opacity-100">
                      Önizle
                    </span>
                  </span>
                </button>
              )}
            </div>
            {!isVideoEntry(img) && img.src.trim() && !thumbLoadFailed[i] && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLightboxSrc(img.src)}
                  className="rounded border border-border-subtle px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted transition hover:border-admin-violet/40 hover:text-admin-violet"
                >
                  Tam boyut
                </button>
                <a
                  href={img.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-border-subtle px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-admin-violet transition hover:border-admin-violet/40"
                >
                  Yeni sekme
                </a>
              </div>
            )}
            {isVideoEntry(img) && img.src.trim() && (
              <a
                href={img.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit rounded border border-border-subtle px-2 py-1 font-mono text-[10px] text-admin-violet"
              >
                Videoyu aç
              </a>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={img.src}
              onChange={(e) => {
                const next = [...images];
                next[i] = { ...next[i]!, src: e.target.value };
                onChange(next);
                setThumbLoadFailed((prev) => ({ ...prev, [i]: false }));
              }}
              placeholder="https://... — Image URL"
              rows={2}
              className="admin-input-focus mb-2 min-h-[3.25rem] w-full resize-none border border-border bg-surface px-2 py-1.5 font-sans text-sm leading-relaxed text-ink placeholder:text-ink-faint"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <textarea
                value={img.alt.en}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = { ...next[i]!, alt: { ...next[i]!.alt, en: e.target.value } };
                  onChange(next);
                }}
                placeholder="Alt (EN) — short description for accessibility"
                rows={2}
                className="admin-input-focus min-h-[3.25rem] min-w-0 flex-1 resize-none border border-border bg-surface px-2 py-1.5 font-mono text-xs leading-relaxed text-ink placeholder:text-ink-faint sm:max-w-[50%]"
              />
              <textarea
                value={img.alt.tr}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = { ...next[i]!, alt: { ...next[i]!.alt, tr: e.target.value } };
                  onChange(next);
                }}
                placeholder="Alt (TR) — short description for accessibility"
                rows={2}
                className="admin-input-focus min-h-[3.25rem] min-w-0 flex-1 resize-none border border-border bg-surface px-2 py-1.5 font-mono text-xs leading-relaxed text-ink placeholder:text-ink-faint sm:max-w-[50%]"
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="text-sm disabled:opacity-30">
              ↑
            </button>
            <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="text-sm disabled:opacity-30">
              ↓
            </button>
            <button type="button" onClick={() => removeImage(i)} className="font-mono text-[11px] text-ink-muted hover:text-red-500">
              Remove
            </button>
          </div>
        </div>
      ))}
      {/* Upload zone */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (canUpload) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-6 transition-colors ${
          canUpload
            ? dragActive
              ? "border-admin-violet/50 bg-surface"
              : "border-border bg-surface/80"
            : "cursor-not-allowed border-border-subtle opacity-60"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-sans text-sm font-medium text-ink">
              Fotoğraf yükle / Upload photos
            </p>
            <p className="mt-1 font-mono text-[11px] text-ink-muted">
              {canUpload
                ? "Dosyaları buraya sürükleyin veya seçin (JPEG, PNG, GIF, WebP, SVG · en fazla 5MB)"
                : "Yeni proje: önce geçerli bir Slug girin (küçük harf, tire). / Enter a valid slug first."}
            </p>
          </div>
          <label
            className={`shrink-0 cursor-pointer border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] ${
              canUpload && !uploading
                ? "border-border bg-surface-raised text-ink transition hover:border-admin-violet/40 hover:text-admin-violet"
                : "cursor-not-allowed border-border-subtle text-ink-faint"
            }`}
          >
            {uploading ? "Yükleniyor… / Uploading…" : "Dosya seç / Choose files"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              disabled={!canUpload || uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-start">
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          veya URL / or URL:
        </span>
        <AddImageInput onAdd={addImage} />
      </div>
    </div>
  );
}
