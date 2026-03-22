import type {
  ProjectRecord,
  LocalizedString,
  ProjectImage,
  ProjectLinks,
  TechnicalBlock,
  ProjectDataTable,
} from "@/types/project";
import { supabase } from "./supabase";

function parseJson<T>(s: string | null): T | undefined {
  if (!s) return undefined;
  try {
    return JSON.parse(s) as T;
  } catch {
    return undefined;
  }
}

type DbProject = {
  id: string;
  slug: string;
  date: string;
  status: string;
  featured: boolean;
  technical_structure: string | null;
  data_table: string | null;
  links: string | null;
  project_content: Array<{
    locale: string;
    title: string;
    short_description: string;
    summary: string;
    domain: string | null;
    focus: string | null;
    problem: string;
    approach: string;
    outcome: string;
    detail: string | null;
    status_label: string | null;
  }>;
  project_tech: Array<{ tag: string }>;
  project_tool: Array<{ tool: string }>;
  project_image: Array<{
    src: string;
    alt_tr: string;
    alt_en: string;
    type: string;
    sort_order: number;
    is_video_url: boolean;
  }>;
};

function toProjectRecord(p: DbProject): ProjectRecord {
  const contents = p.project_content ?? [];
  const byLocale = Object.fromEntries(contents.map((c) => [c.locale, c]));
  const c = (key: string) => (loc: string) =>
    (byLocale[loc] as Record<string, string | null> | undefined)?.[key] ?? "";

  const localized = (
    key:
      | "title"
      | "short_description"
      | "summary"
      | "domain"
      | "focus"
      | "problem"
      | "approach"
      | "outcome"
      | "detail"
      | "status_label"
  ): LocalizedString => ({
    en: c(key)("en"),
    tr: c(key)("tr"),
  });

  const linksData = parseJson<ProjectLinks>(p.links);
  const sortedImages = [...(p.project_image ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const images: ProjectImage[] = [
    ...sortedImages.map((img) => ({
      src: img.src,
      alt: { en: img.alt_en, tr: img.alt_tr },
      type: (img.type === "VIDEO" ? "video" : "image") as "image" | "video",
    })),
    ...(linksData?.videoUrl
      ? [
          {
            src: linksData.videoUrl,
            alt: { en: "Video", tr: "Video" } as LocalizedString,
            type: "video" as const,
          },
        ]
      : []),
  ];

  return {
    id: p.slug,
    slug: p.slug,
    date: p.date.slice(0, 10),
    title: {
      en: c("title")("en"),
      tr: c("title")("tr"),
    },
    shortDescription: localized("short_description"),
    summary: localized("summary"),
    domain: localized("domain"),
    focus: localized("focus"),
    problem: localized("problem"),
    approach: localized("approach"),
    outcome: localized("outcome"),
    detail: localized("detail"),
    status:
      c("status_label")("en") || c("status_label")("tr")
        ? localized("status_label")
        : undefined,
    tech: (p.project_tech ?? []).map((t) => t.tag),
    tools: (p.project_tool ?? []).map((t) => t.tool),
    images,
    links: linksData,
    technicalStructure: parseJson<TechnicalBlock[]>(p.technical_structure),
    dataTable: parseJson<ProjectDataTable>(p.data_table),
    featured: p.featured,
  };
}

export function dbToProjectRecord(p: DbProject): ProjectRecord {
  return toProjectRecord(p);
}

export async function getAllProjects(opts?: {
  publishedOnly?: boolean;
}): Promise<ProjectRecord[]> {
  try {
    let q = supabase
      .from("project")
      .select(
        `
        *,
        project_content(*),
        project_tech(*),
        project_tool(*),
        project_image(*)
      `
      )
      .order("sort_order")
      .order("date", { ascending: false });

    if (opts?.publishedOnly) {
      q = q.eq("status", "PUBLISHED");
    }

    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []) as DbProject[];
    return rows.map(toProjectRecord);
  } catch {
    return [];
  }
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  try {
    const { data: bySlug } = await supabase
      .from("project")
      .select(
        `
        *,
        project_content(*),
        project_tech(*),
        project_tool(*),
        project_image(*)
      `
      )
      .eq("slug", id)
      .single();

    if (bySlug) return toProjectRecord(bySlug as DbProject);

    const { data: byId } = await supabase
      .from("project")
      .select(
        `
        *,
        project_content(*),
        project_tech(*),
        project_tool(*),
        project_image(*)
      `
      )
      .eq("id", id)
      .single();

    if (byId) return toProjectRecord(byId as DbProject);
    return null;
  } catch {
    return null;
  }
}

export async function getPublishedProjectById(
  id: string
): Promise<ProjectRecord | null> {
  try {
    const { data: bySlug } = await supabase
      .from("project")
      .select(
        `
        *,
        project_content(*),
        project_tech(*),
        project_tool(*),
        project_image(*)
      `
      )
      .eq("slug", id)
      .eq("status", "PUBLISHED")
      .single();

    if (bySlug) return toProjectRecord(bySlug as DbProject);

    const { data: byId } = await supabase
      .from("project")
      .select(
        `
        *,
        project_content(*),
        project_tech(*),
        project_tool(*),
        project_image(*)
      `
      )
      .eq("id", id)
      .eq("status", "PUBLISHED")
      .single();

    if (byId) return toProjectRecord(byId as DbProject);
    return null;
  } catch {
    return null;
  }
}

export async function getLatestProjects(
  count: number
): Promise<ProjectRecord[]> {
  try {
    const { data, error } = await supabase
      .from("project")
      .select(
        `
        *,
        project_content(*),
        project_tech(*),
        project_tool(*),
        project_image(*)
      `
      )
      .eq("status", "PUBLISHED")
      .order("date", { ascending: false })
      .limit(count);

    if (error) throw error;
    const rows = (data ?? []) as DbProject[];
    return rows.map(toProjectRecord);
  } catch {
    return [];
  }
}

export async function getAllTechTags(): Promise<string[]> {
  try {
    const { data: projectIds } = await supabase
      .from("project")
      .select("id")
      .eq("status", "PUBLISHED");
    const ids = (projectIds ?? []).map((r) => r.id);
    if (ids.length === 0) return [];

    const { data: tech, error } = await supabase
      .from("project_tech")
      .select("tag")
      .in("project_id", ids);
    if (error) throw error;
    const tags = (tech ?? []).map((r) => r.tag);
    return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export async function getAllTechTagsFromDb(): Promise<string[]> {
  const { data, error } = await supabase.from("project_tech").select("tag");
  if (error) throw error;
  const tags = (data ?? []).map((r) => r.tag);
  return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
}

export async function getAllToolNamesFromDb(): Promise<string[]> {
  const { data, error } = await supabase.from("project_tool").select("tool");
  if (error) throw error;
  const tools = (data ?? []).map((r) => r.tool);
  return [...new Set(tools)].sort((a, b) => a.localeCompare(b));
}

export async function getAdjacentProjects(currentId: string): Promise<{
  prev: ProjectRecord | null;
  next: ProjectRecord | null;
}> {
  const all = await getAllProjects({ publishedOnly: true });
  const idx = all.findIndex((p) => p.id === currentId);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1]! : null,
    next: idx < all.length - 1 ? all[idx + 1]! : null,
  };
}

/** Admin: fetch project by id or slug with full relations. */
export async function getProjectForAdmin(id: string): Promise<{
  id: string;
  record: ProjectRecord;
  status: "DRAFT" | "PUBLISHED";
} | null> {
  const { data: bySlug } = await supabase
    .from("project")
    .select(
      `
      id, status,
      *,
      project_content(*),
      project_tech(*),
      project_tool(*),
      project_image(*)
    `
    )
    .eq("slug", id)
    .single();

  if (bySlug) {
    return {
      id: bySlug.id,
      record: toProjectRecord(bySlug as DbProject),
      status: bySlug.status as "DRAFT" | "PUBLISHED",
    };
  }

  const { data: byId } = await supabase
    .from("project")
    .select(
      `
      id, status,
      *,
      project_content(*),
      project_tech(*),
      project_tool(*),
      project_image(*)
    `
    )
    .eq("id", id)
    .single();

  if (byId) {
    return {
      id: byId.id,
      record: toProjectRecord(byId as DbProject),
      status: byId.status as "DRAFT" | "PUBLISHED",
    };
  }
  return null;
}
