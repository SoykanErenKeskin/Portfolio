"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProjectRecord } from "@/types/project";
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
            <input
              type="text"
              value={data.slug}
              onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
              placeholder="my-project"
              required
              className="admin-input-focus w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
              disabled={isEdit}
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
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={data.status === "DRAFT"}
                onChange={() => update({ status: "DRAFT" })}
                className="rounded-full"
              />
              <span className="text-sm">Draft</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={data.status === "PUBLISHED"}
                onChange={() => update({ status: "PUBLISHED" })}
                className="rounded-full"
              />
              <span className="text-sm">Published</span>
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.featured}
              onChange={(e) => update({ featured: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Featured</span>
          </label>
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
                  rows={key === "problem" || key === "approach" || key === "outcome" || key === "summary" ? 4 : 2}
                  className="admin-input-focus w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
                />
              </div>
              <div className="flex shrink-0 flex-col justify-end pb-1">
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
            placeholder="Seç veya yeni ekle…"
          />
          <TagPicker
            label="Tools"
            selected={data.tools}
            onChange={(tools) => update({ tools })}
            availableTags={availableTools}
            placeholder="Seç veya yeni ekle…"
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
            <input
              type="url"
              value={data.links?.github ?? ""}
              onChange={(e) => update({ links: { ...data.links, github: e.target.value || undefined } })}
              placeholder="https://github.com/..."
              className="admin-input-focus w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Live / Demo
            </label>
            <input
              type="url"
              value={data.links?.live ?? ""}
              onChange={(e) => update({ links: { ...data.links, live: e.target.value || undefined } })}
              placeholder="https://..."
              className="admin-input-focus w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Video URL (optional)
            </label>
            <input
              type="url"
              value={data.links?.videoUrl ?? ""}
              onChange={(e) => update({ links: { ...data.links, videoUrl: e.target.value || undefined } })}
              placeholder="https://youtube.com/... or direct video URL"
              className="admin-input-focus w-full border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
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
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
        placeholder="Image or video URL"
        className="admin-input-focus flex-1 border border-border bg-surface px-3 py-2 font-sans text-sm text-ink"
      />
      <button type="button" onClick={submit} className="border border-border bg-surface-raised px-4 py-2 font-mono text-sm text-ink transition hover:border-admin-violet/40">
        Add URL
      </button>
    </>
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
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0 || !canUpload || !uploadFolderId) return;
    setUploading(true);
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("projectId", uploadFolderId);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok && json.src) {
          addImage(json.src);
        } else {
          alert(json.error ?? `Yükleme başarısız / Upload failed: ${file.name}`);
        }
      }
    } catch {
      alert("Yükleme hatası / Upload error");
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

  return (
    <div className="space-y-4">
      {images.map((img, i) => (
        <div key={i} className="flex items-start gap-4 border border-border bg-surface p-3">
          <div className="h-16 w-24 shrink-0 overflow-hidden border border-border-subtle bg-surface-raised">
            {img.type === "video" || img.src.match(/\.(mp4|webm)(\?|$)/i) ? (
              <div className="flex h-full items-center justify-center font-mono text-[10px] text-ink-faint">Video</div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.src} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={img.src}
              onChange={(e) => {
                const next = [...images];
                next[i] = { ...next[i]!, src: e.target.value };
                onChange(next);
              }}
              placeholder="Image URL"
              className="admin-input-focus mb-2 w-full border border-border bg-surface px-2 py-1 font-sans text-sm text-ink"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={img.alt.en}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = { ...next[i]!, alt: { ...next[i]!.alt, en: e.target.value } };
                  onChange(next);
                }}
                placeholder="Alt (EN)"
                className="admin-input-focus w-32 border border-border bg-surface px-2 py-1 font-mono text-xs text-ink"
              />
              <input
                type="text"
                value={img.alt.tr}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = { ...next[i]!, alt: { ...next[i]!.alt, tr: e.target.value } };
                  onChange(next);
                }}
                placeholder="Alt (TR)"
                className="admin-input-focus w-32 border border-border bg-surface px-2 py-1 font-mono text-xs text-ink"
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

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">veya URL / or URL:</span>
        <AddImageInput onAdd={addImage} />
      </div>
    </div>
  );
}
