import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";

export async function GET(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  const { data: items, error } = await supabase
    .from("faq")
    .select("*")
    .eq("locale", locale)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    (items ?? []).map((r) => ({
      id: r.id,
      locale: r.locale,
      question: r.question,
      answer: r.answer,
      sortOrder: r.sort_order,
    }))
  );
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
    locale: string;
    question: string;
    answer: string;
    sortOrder?: number;
  };

  const { data: maxRow } = await supabase
    .from("faq")
    .select("sort_order")
    .eq("locale", data.locale)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const maxOrder = maxRow?.sort_order ?? -1;

  const { data: item, error } = await supabase
    .from("faq")
    .insert({
      locale: data.locale,
      question: data.question,
      answer: data.answer,
      sort_order: data.sortOrder ?? maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { ...item, sortOrder: item.sort_order },
    { status: 201 }
  );
}
