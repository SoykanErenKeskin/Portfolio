import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("locale", "en")
    .single();

  if (!profile) {
    return NextResponse.json({
      name: "",
      tagline: "",
      valueProp: "",
      supporting: "",
      email: "",
      github: "",
      linkedin: "",
      website: "",
    });
  }
  return NextResponse.json({
    name: profile.name ?? "",
    tagline: profile.tagline ?? "",
    valueProp: profile.value_prop ?? "",
    supporting: profile.supporting ?? "",
    email: profile.email ?? "",
    github: profile.github ?? "",
    linkedin: profile.linkedin ?? "",
    website: profile.website ?? "",
  });
}

export async function PUT(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as {
    name?: string;
    tagline?: string;
    valueProp?: string;
    supporting?: string;
    email?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };

  const { data: profile, error } = await supabase
    .from("profile")
    .upsert(
      {
        locale: "en",
        name: data.name ?? "",
        tagline: data.tagline ?? "",
        value_prop: data.valueProp ?? null,
        supporting: data.supporting ?? null,
        email: data.email ?? "",
        github: data.github ?? "",
        linkedin: data.linkedin ?? "",
        website: data.website ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "locale" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    name: profile.name ?? "",
    tagline: profile.tagline ?? "",
    valueProp: profile.value_prop ?? "",
    supporting: profile.supporting ?? "",
    email: profile.email ?? "",
    github: profile.github ?? "",
    linkedin: profile.linkedin ?? "",
    website: profile.website ?? "",
  });
}
