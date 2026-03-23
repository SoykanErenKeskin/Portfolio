import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { getAllTechTagsFromDb, getAllToolNamesFromDb } from "@/lib/db/projects";
import { supabase } from "@/lib/db/supabase";

/** Tech/tool suggestions for project form: registry keys + values from all projects. */
export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const [projectTech, projectTools, { data: registry }] = await Promise.all([
      getAllTechTagsFromDb(),
      getAllToolNamesFromDb(),
      supabase
        .from("tech_tool_registry")
        .select("key, label_en, type")
        .order("type")
        .order("sort_order"),
    ]);

    const registryTech = (registry ?? [])
      .filter((r) => r.type === "tech")
      .map((r) => (r.label_en?.trim() || r.key) || r.key);
    const registryTools = (registry ?? [])
      .filter((r) => r.type === "tool")
      .map((r) => (r.label_en?.trim() || r.key) || r.key);

    const tech = [...new Set([...registryTech, ...projectTech])].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    const tools = [...new Set([...registryTools, ...projectTools])].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return NextResponse.json({ tech, tools });
  } catch (e) {
    console.error("GET /api/admin/tags:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load tags" },
      { status: 500 }
    );
  }
}
