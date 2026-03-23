import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/db/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const RESUME_PATH = "resume/resume.pdf";

const UPLOAD_BUCKET = process.env.SUPABASE_UPLOAD_BUCKET?.trim() || "";

/** POST: Upload resume PDF (admin only). Replaces existing. */
export async function POST(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  if (!UPLOAD_BUCKET) {
    return NextResponse.json(
      { error: "SUPABASE_UPLOAD_BUCKET not configured. Set it in .env for resume uploads." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid or too large upload body. Max 5MB." },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const mime = file.type?.toLowerCase() || "";
  if (mime !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { error: "Only PDF files are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error: upErr } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(RESUME_PATH, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (upErr) {
    console.error("Resume upload error:", upErr);
    return NextResponse.json(
      { error: upErr.message || "Storage upload failed" },
      { status: 500 }
    );
  }

  const { data: pub } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(RESUME_PATH);
  const publicUrl = pub.publicUrl;

  const { error: updateErr } = await supabase
    .from("profile")
    .update({
      resume_url: publicUrl,
      resume_name: "Resume Soykan Eren Keskin",
      updated_at: new Date().toISOString(),
    })
    .eq("locale", "en");

  if (updateErr) {
    console.error("Profile resume_url update:", updateErr);
    return NextResponse.json(
      { error: "Upload succeeded but profile update failed. Resume URL may not show on site." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: publicUrl, success: true });
}
