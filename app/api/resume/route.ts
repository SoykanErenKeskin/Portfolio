import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { supabase } from "@/lib/db/supabase";

const DEFAULT_TITLE = "Resume Soykan Eren Keskin";

/** GET: Stream resume PDF with correct filename and metadata Title. */
export async function GET() {
  const { data, error } = await supabase
    .from("profile")
    .select("resume_url, resume_name")
    .eq("locale", "en")
    .maybeSingle();

  if (error || !data?.resume_url?.trim()) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const url = data.resume_url.trim();
  const name = (data as { resume_name?: string }).resume_name?.trim() || DEFAULT_TITLE;
  const filename = name.endsWith(".pdf") ? name : `${name}.pdf`;
  const encodedFilename = encodeURIComponent(filename);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Resume unavailable" }, { status: 502 });
  }

  const arrayBuffer = await res.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
  pdfDoc.setTitle(name);
  pdfDoc.setModificationDate(new Date());
  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodedFilename}`,
    },
  });
}
