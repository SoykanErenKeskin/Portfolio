import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

/** Public GET: learning timeline entries, grouped by year. */
export async function GET() {
  const { data, error } = await supabase
    .from("learning_timeline")
    .select("id, tool_en, tool_tr, year, level, sort_order")
    .order("year", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((r) => ({
    id: r.id,
    toolEn: r.tool_en,
    toolTr: r.tool_tr,
    year: r.year,
    level: r.level as "basic" | "intermediate" | "advanced",
    sortOrder: r.sort_order,
  }));

  return NextResponse.json(items);
}
