import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { createProjectSchema } from "@/lib/api/project-schema";
import { supabase } from "@/lib/db/supabase";
import { dbToProjectRecord } from "@/lib/db/projects";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data: projects, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const records = (projects ?? []).map((p) => ({
    ...dbToProjectRecord(p as Parameters<typeof dbToProjectRecord>[0]),
    publishStatus: p.status as "DRAFT" | "PUBLISHED",
  }));
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const { data: existing } = await supabase
    .from("project")
    .select("id")
    .eq("slug", data.slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "A project with this slug already exists" },
      { status: 409 }
    );
  }

  const { data: project, error: projectError } = await supabase
    .from("project")
    .insert({
      slug: data.slug,
      date: data.date + "T12:00:00Z",
      status: data.status,
      featured: data.featured,
      technical_structure: data.technicalStructure
        ? JSON.stringify(data.technicalStructure)
        : null,
      data_table: data.dataTable ? JSON.stringify(data.dataTable) : null,
      links: data.links ? JSON.stringify(data.links) : null,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message ?? "Failed to create project" },
      { status: 500 }
    );
  }

  const projectId = project.id;

  await supabase.from("project_content").insert([
    {
      project_id: projectId,
      locale: "en",
      title: data.title.en,
      short_description: data.shortDescription.en,
      summary: data.summary.en,
      domain: data.domain?.en ?? null,
      focus: data.focus?.en ?? null,
      problem: data.problem.en,
      approach: data.approach.en,
      outcome: data.outcome.en,
      detail: data.detail?.en ?? null,
      status_label: data.statusLabel?.en ?? null,
    },
    {
      project_id: projectId,
      locale: "tr",
      title: data.title.tr,
      short_description: data.shortDescription.tr,
      summary: data.summary.tr,
      domain: data.domain?.tr ?? null,
      focus: data.focus?.tr ?? null,
      problem: data.problem.tr,
      approach: data.approach.tr,
      outcome: data.outcome.tr,
      detail: data.detail?.tr ?? null,
      status_label: data.statusLabel?.tr ?? null,
    },
  ]);

  if (data.tech.length > 0) {
    await supabase.from("project_tech").insert(
      data.tech.map((tag) => ({ project_id: projectId, tag }))
    );
  }
  if (data.tools.length > 0) {
    await supabase.from("project_tool").insert(
      data.tools.map((tool) => ({ project_id: projectId, tool }))
    );
  }
  if (data.images.length > 0) {
    await supabase.from("project_image").insert(
      data.images.map((img, i) => ({
        project_id: projectId,
        src: img.src,
        alt_tr: img.alt?.tr ?? "",
        alt_en: img.alt?.en ?? "",
        type: img.type === "video" ? "VIDEO" : "IMAGE",
        sort_order: i,
        is_video_url: img.src.startsWith("http"),
      }))
    );
  }

  const { data: full } = await supabase
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
    .eq("id", projectId)
    .single();

  if (!full) {
    return NextResponse.json({ error: "Project created but fetch failed" }, { status: 500 });
  }

  const record = dbToProjectRecord(full as Parameters<typeof dbToProjectRecord>[0]);
  return NextResponse.json(record, { status: 201 });
}
