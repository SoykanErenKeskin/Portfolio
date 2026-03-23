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
    key?: string;
    labelEn?: string;
    labelTr?: string;
    type?: "tech" | "tool";
    sortOrder?: number;
  };

  const updates: Record<string, unknown> = {};
  if (typeof data.key === "string" && data.key.trim()) updates.key = data.key.trim();
  if (typeof data.labelEn === "string") updates.label_en = data.labelEn.trim();
  if (typeof data.labelTr === "string") updates.label_tr = data.labelTr.trim();
  if (data.type === "tool" || data.type === "tech") updates.type = data.type;
  if (typeof data.sortOrder === "number") updates.sort_order = data.sortOrder;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data: item, error } = await supabase
    .from("tech_tool_registry")
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
    key: item.key,
    labelEn: item.label_en,
    labelTr: item.label_tr,
    type: item.type,
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

  const { data: item, error: fetchError } = await supabase
    .from("tech_tool_registry")
    .select("key, label_en, type")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Not found" },
      { status: fetchError ? 500 : 404 }
    );
  }

  const key = (item.key ?? "").trim();
  const labelEn = (item.label_en ?? "").trim() || key;
  const valuesToRemove = [...new Set([key, labelEn].filter(Boolean))];

  if (item.type === "tech" && valuesToRemove.length > 0) {
    await supabase.from("project_tech").delete().in("tag", valuesToRemove);
  }
  if (item.type === "tool" && valuesToRemove.length > 0) {
    await supabase.from("project_tool").delete().in("tool", valuesToRemove);
  }

  if (valuesToRemove.length > 0) {
    await supabase.from("learning_timeline").delete().in("tool_en", valuesToRemove);
  }

  const { error } = await supabase.from("tech_tool_registry").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
