import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data, error } = await supabase
    .from("learning_timeline")
    .select("*")
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
    level: r.level,
    sortOrder: r.sort_order,
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
    toolEn: string;
    toolTr: string;
    year: number;
    level?: "basic" | "intermediate" | "advanced";
    sortOrder?: number;
  };

  const level = ["basic", "intermediate", "advanced"].includes(data.level ?? "")
    ? data.level
    : "intermediate";

  const toolEn = (data.toolEn ?? "").trim();
  const { data: existing } = await supabase
    .from("learning_timeline")
    .select("id")
    .eq("tool_en", toolEn)
    .eq("level", level)
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Same tool at this level already exists" },
      { status: 409 }
    );
  }

  const { data: maxRow } = await supabase
    .from("learning_timeline")
    .select("sort_order")
    .eq("year", data.year)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = data.sortOrder ?? (maxRow?.sort_order ?? -1) + 1;

  const { data: item, error } = await supabase
    .from("learning_timeline")
    .insert({
      tool_en: toolEn,
      tool_tr: (data.toolTr ?? "").trim(),
      year: data.year,
      level,
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
      toolEn: item.tool_en,
      toolTr: item.tool_tr,
      year: item.year,
      level: item.level,
      sortOrder: item.sort_order,
    },
    { status: 201 }
  );
}
