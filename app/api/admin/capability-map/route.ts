import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabase
    .from("capability_map_category")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((r) => ({
    id: r.id,
    key: r.key,
    labelEn: r.label_en ?? "",
    labelTr: r.label_tr ?? "",
    itemsEn: Array.isArray(r.items_en) ? (r.items_en as string[]) : [],
    itemsTr: Array.isArray(r.items_tr) ? (r.items_tr as string[]) : [],
    sortOrder: r.sort_order ?? 0,
  }));

  return NextResponse.json(items);
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

  const data = body as {
    key: string;
    labelEn: string;
    labelTr: string;
    itemsEn?: string[];
    itemsTr?: string[];
    sortOrder?: number;
  };

  if (!(data.key && typeof data.key === "string") || !data.key.trim()) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const { data: maxRow } = await supabase
    .from("capability_map_category")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder =
    typeof data.sortOrder === "number" ? data.sortOrder : (maxRow?.sort_order ?? -1) + 1;
  const itemsEn = Array.isArray(data.itemsEn) ? data.itemsEn : [];
  const itemsTr = Array.isArray(data.itemsTr) ? data.itemsTr : [];

  const { data: item, error } = await supabase
    .from("capability_map_category")
    .insert({
      key: data.key.trim().toLowerCase(),
      label_en: (data.labelEn ?? "").trim(),
      label_tr: (data.labelTr ?? "").trim(),
      items_en: itemsEn,
      items_tr: itemsTr,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      id: item.id,
      key: item.key,
      labelEn: item.label_en,
      labelTr: item.label_tr,
      itemsEn: Array.isArray(item.items_en) ? item.items_en : [],
      itemsTr: Array.isArray(item.items_tr) ? item.items_tr : [],
      sortOrder: item.sort_order,
    },
    { status: 201 }
  );
}
