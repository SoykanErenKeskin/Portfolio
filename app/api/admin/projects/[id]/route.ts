import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { updateProjectSchema } from "@/lib/api/project-schema";
import { supabase } from "@/lib/db/supabase";
import { dbToProjectRecord, getProjectForAdmin } from "@/lib/db/projects";

async function findExisting(id: string) {
  const { data: bySlug } = await supabase
    .from("project")
    .select("id, slug")
    .eq("slug", id)
    .single();
  if (bySlug) return bySlug;

  const { data: byId } = await supabase
    .from("project")
    .select("id, slug")
    .eq("id", id)
    .single();
  return byId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const result = await getProjectForAdmin(id);
  if (!result) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json(result.record);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const existing = await findExisting(id);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (data.slug && data.slug !== existing.slug) {
    const { data: slugTaken } = await supabase
      .from("project")
      .select("id")
      .eq("slug", data.slug)
      .single();
    if (slugTaken) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 }
      );
    }
  }

  const contentKeys =
    data.title !== undefined ||
    data.shortDescription !== undefined ||
    data.summary !== undefined ||
    data.domain !== undefined ||
    data.focus !== undefined ||
    data.problem !== undefined ||
    data.approach !== undefined ||
    data.outcome !== undefined ||
    data.detail !== undefined ||
    data.statusLabel !== undefined;

  if (contentKeys) {
    for (const locale of ["en", "tr"] as const) {
      const row = {
        project_id: existing.id,
        locale,
        title: (data.title ?? { en: "", tr: "" })[locale],
        short_description: (data.shortDescription ?? { en: "", tr: "" })[locale],
        summary: (data.summary ?? { en: "", tr: "" })[locale],
        domain: data.domain?.[locale] ?? null,
        focus: data.focus?.[locale] ?? null,
        problem: (data.problem ?? { en: "", tr: "" })[locale],
        approach: (data.approach ?? { en: "", tr: "" })[locale],
        outcome: (data.outcome ?? { en: "", tr: "" })[locale],
        detail: data.detail?.[locale] ?? null,
        status_label: data.statusLabel?.[locale] ?? null,
      };
      await supabase.from("project_content").upsert(row, {
        onConflict: "project_id,locale",
      });
    }
  }

  const projectUpdate: Record<string, unknown> = {};
  if (data.slug) projectUpdate.slug = data.slug;
  if (data.date) projectUpdate.date = data.date + "T12:00:00Z";
  if (data.status) projectUpdate.status = data.status;
  if (data.featured !== undefined) projectUpdate.featured = data.featured;
  if (data.technicalStructure !== undefined)
    projectUpdate.technical_structure = data.technicalStructure
      ? JSON.stringify(data.technicalStructure)
      : null;
  if (data.dataTable !== undefined)
    projectUpdate.data_table = data.dataTable
      ? JSON.stringify(data.dataTable)
      : null;
  if (data.links !== undefined)
    projectUpdate.links = data.links ? JSON.stringify(data.links) : null;
  projectUpdate.updated_at = new Date().toISOString();

  if (Object.keys(projectUpdate).length > 0) {
    await supabase.from("project").update(projectUpdate).eq("id", existing.id);
  }

  if (data.tech !== undefined) {
    await supabase.from("project_tech").delete().eq("project_id", existing.id);
    if (data.tech.length > 0) {
      await supabase
        .from("project_tech")
        .insert(data.tech.map((tag) => ({ project_id: existing.id, tag })));
    }
  }
  if (data.tools !== undefined) {
    await supabase.from("project_tool").delete().eq("project_id", existing.id);
    if (data.tools.length > 0) {
      await supabase
        .from("project_tool")
        .insert(data.tools.map((tool) => ({ project_id: existing.id, tool })));
    }
  }
  if (data.images !== undefined) {
    await supabase.from("project_image").delete().eq("project_id", existing.id);
    if (data.images.length > 0) {
      await supabase.from("project_image").insert(
        data.images.map((img, i) => ({
          project_id: existing.id,
          src: img.src,
          alt_tr: img.alt?.tr ?? "",
          alt_en: img.alt?.en ?? "",
          type: img.type === "video" ? "VIDEO" : "IMAGE",
          sort_order: i,
          is_video_url: img.src.startsWith("http"),
        }))
      );
    }
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
    .eq("id", existing.id)
    .single();

  if (!full) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const record = dbToProjectRecord(
    full as Parameters<typeof dbToProjectRecord>[0]
  );
  return NextResponse.json(record);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const existing = await findExisting(id);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await supabase.from("project").delete().eq("id", existing.id);
  return NextResponse.json({ success: true });
}
