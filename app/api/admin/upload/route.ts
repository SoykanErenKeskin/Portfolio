import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const formData = await request.formData();
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

  const mime = file.type;
  if (!ALLOWED_TYPES.includes(mime)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG." },
      { status: 400 }
    );
  }

  const ext = mime === "image/svg+xml" ? "svg" : mime.split("/")[1] ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const relPath = path.join("uploads", "projects", safeProjectId, filename);

  const publicDir = path.join(process.cwd(), "public");
  const fullDir = path.join(publicDir, "uploads", "projects", safeProjectId);
  const fullPath = path.join(fullDir, filename);

  try {
    await mkdir(fullDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }

  const urlPath = `/${relPath.replace(/\\/g, "/")}`;
  return NextResponse.json({ src: urlPath, filename });
}
