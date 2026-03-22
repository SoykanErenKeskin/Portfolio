import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { getAllTechTagsFromDb, getAllToolNamesFromDb } from "@/lib/db/projects";

/** Distinct tech / tool values from all projects (for admin tag pickers). */
export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  try {
    const [tech, tools] = await Promise.all([
      getAllTechTagsFromDb(),
      getAllToolNamesFromDb(),
    ]);
    return NextResponse.json({ tech, tools });
  } catch (e) {
    console.error("GET /api/admin/tags:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load tags" },
      { status: 500 }
    );
  }
}
