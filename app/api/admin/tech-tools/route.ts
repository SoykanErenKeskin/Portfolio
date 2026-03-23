import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";

export async function GET(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const approvedOnly = searchParams.get("approvedOnly") === "true";

  const { data, error } = await supabase
    .from("tech_tool_registry")
    .select("*")
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? [])
    .filter(
      (r) =>
        !approvedOnly ||
        (r.label_tr != null && String(r.label_tr).trim() !== "")
    )
    .map((r) => ({
    id: r.id,
    key: r.key,
    labelEn: r.label_en ?? "",
    labelTr: r.label_tr ?? "",
    type: r.type === "tool" ? "tool" : "tech",
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
    labelEn?: string;
    labelTr?: string;
    type?: "tech" | "tool";
    sortOrder?: number;
  };

  if (!(data.key && typeof data.key === "string") || !data.key.trim()) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const type = data.type === "tool" ? "tool" : "tech";

  const { data: maxRow } = await supabase
    .from("tech_tool_registry")
    .select("sort_order")
    .eq("type", type)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder =
    typeof data.sortOrder === "number" ? data.sortOrder : (maxRow?.sort_order ?? -1) + 1;

  const { data: item, error } = await supabase
    .from("tech_tool_registry")
    .insert({
      key: data.key.trim(),
      label_en: (data.labelEn ?? "").trim(),
      label_tr: (data.labelTr ?? "").trim(),
      type,
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
      type: item.type,
      sortOrder: item.sort_order,
    },
    { status: 201 }
  );
}
