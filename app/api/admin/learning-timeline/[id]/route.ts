import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";

export async function PUT(
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

  const data = body as {
    toolEn?: string;
    toolTr?: string;
    year?: number;
    level?: "basic" | "intermediate" | "advanced";
    sortOrder?: number;
  };

  const updates: Record<string, unknown> = {};
  if (typeof data.toolEn === "string") updates.tool_en = data.toolEn.trim();
  if (typeof data.toolTr === "string") updates.tool_tr = data.toolTr.trim();
  if (typeof data.year === "number") updates.year = data.year;
  if (["basic", "intermediate", "advanced"].includes(data.level ?? "")) {
    updates.level = data.level;
  }
  if (typeof data.sortOrder === "number") updates.sort_order = data.sortOrder;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data: item, error } = await supabase
    .from("learning_timeline")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: item.id,
    toolEn: item.tool_en,
    toolTr: item.tool_tr,
    year: item.year,
    level: item.level,
    sortOrder: item.sort_order,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;

  const { error } = await supabase.from("learning_timeline").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
