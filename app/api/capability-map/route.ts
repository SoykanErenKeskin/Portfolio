import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

/** Public GET: capability map categories with items. */
export async function GET() {
  const { data, error } = await supabase
    .from("capability_map_category")
    .select("id, key, label_en, label_tr, items_en, items_tr, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const categories = (data ?? []).map((r) => ({
    id: r.id,
    key: r.key,
    labelEn: r.label_en ?? "",
    labelTr: r.label_tr ?? "",
    itemsEn: Array.isArray(r.items_en) ? (r.items_en as string[]) : [],
    itemsTr: Array.isArray(r.items_tr) ? (r.items_tr as string[]) : [],
    sortOrder: r.sort_order ?? 0,
  }));

  return NextResponse.json(categories);
}
