import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/db/supabase";

/** Local fs needs Node; avoid Edge where `writeFile` is unavailable. */
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

function inferMime(file: File): string {
  const t = file.type?.trim();
  if (t && t !== "application/octet-stream") return t;
  const lower = file.name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  return EXT_TO_MIME[ext] ?? "";
}

function isAllowedImage(file: File): boolean {
  const mime = inferMime(file);
  if (!mime) return false;
  return mime.startsWith("image/");
}

function extFromMime(mime: string): string {
  if (mime === "image/svg+xml") return "svg";
  if (mime === "image/jpeg") return "jpg";
  const part = mime.split("/")[1]?.split("+")[0];
  return part && /^[a-z0-9]+$/i.test(part) ? part : "jpg";
}

/** When set, files go to Supabase Storage (public bucket). Otherwise `public/uploads/...`. */
const UPLOAD_BUCKET = process.env.SUPABASE_UPLOAD_BUCKET?.trim() || "";

export async function POST(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (e) {
    console.error("Upload formData parse:", e);
    return NextResponse.json(
      { error: "Invalid or too large upload body. Try a smaller file (max 5MB)." },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!projectId || projectId.trim().length === 0) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const safeProjectId = projectId.replace(/[^a-z0-9-]/gi, "").slice(0, 100);
  if (!safeProjectId) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  if (!isAllowedImage(file)) {
    return NextResponse.json(
      {
        error:
          "Invalid file type. Use JPEG, PNG, GIF, WebP, SVG, or HEIC (or ensure the file has a proper extension).",
      },
      { status: 400 }
    );
  }

  const mime = inferMime(file);
  const ext = extFromMime(mime);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (UPLOAD_BUCKET) {
    const storagePath = `${safeProjectId}/${filename}`;
    const { error: upErr } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mime,
        upsert: false,
      });
    if (upErr) {
      console.error("Supabase storage upload:", upErr);
      return NextResponse.json(
        { error: upErr.message || "Storage upload failed" },
        { status: 500 }
      );
    }
    const { data: pub } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(storagePath);
    return NextResponse.json({ src: pub.publicUrl, filename });
  }

  const relPath = path.join("uploads", "projects", safeProjectId, filename);
  const publicDir = path.join(process.cwd(), "public");
  const fullDir = path.join(publicDir, "uploads", "projects", safeProjectId);
  const fullPath = path.join(fullDir, filename);

  try {
    await mkdir(fullDir, { recursive: true });
    await writeFile(fullPath, buffer);
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to save file. Ensure the app can write to public/uploads (local dev) or set SUPABASE_UPLOAD_BUCKET for production.",
      },
      { status: 500 }
    );
  }

  const urlPath = `/${relPath.replace(/\\/g, "/")}`;
  return NextResponse.json({ src: urlPath, filename });
}
