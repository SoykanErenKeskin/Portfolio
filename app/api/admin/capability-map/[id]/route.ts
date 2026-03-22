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
    itemsEn?: string[];
    itemsTr?: string[];
    sortOrder?: number;
  };

  const updates: Record<string, unknown> = {};
  if (typeof data.key === "string" && data.key.trim())
    updates.key = data.key.trim().toLowerCase();
  if (typeof data.labelEn === "string") updates.label_en = data.labelEn.trim();
  if (typeof data.labelTr === "string") updates.label_tr = data.labelTr.trim();
  if (Array.isArray(data.itemsEn)) updates.items_en = data.itemsEn;
  if (Array.isArray(data.itemsTr)) updates.items_tr = data.itemsTr;
  if (typeof data.sortOrder === "number") updates.sort_order = data.sortOrder;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data: item, error } = await supabase
    .from("capability_map_category")
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
    itemsEn: Array.isArray(item.items_en) ? item.items_en : [],
    itemsTr: Array.isArray(item.items_tr) ? item.items_tr : [],
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

  const { error } = await supabase
    .from("capability_map_category")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
