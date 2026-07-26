import { NextRequest, NextResponse } from "next/server";
import { verifySnapshotPublishToken } from "@/lib/kocaeli-real-estate/publish-auth";
import { publishKocaeliSnapshot } from "@/lib/kocaeli-real-estate/publish-snapshot";
import { readLatestKocaeliSnapshot } from "@/lib/kocaeli-real-estate/snapshot-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

/** ~1.5 MiB raw body — aggregate JSON only. */
const MAX_BODY_BYTES = 1_500_000;

function jsonError(
  status: number,
  error: string,
  details?: string[]
): NextResponse {
  return NextResponse.json(
    details?.length ? { error, details } : { error },
    { status }
  );
}

/**
 * Publish a public-safe Kocaeli snapshot into Supabase Storage.
 * Canonical URL: POST /api/portfolio-snapshot/kocaeli-real-estate
 * Auth: Authorization: Bearer <PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN>
 */
export async function POST(request: NextRequest) {
  if (!verifySnapshotPublishToken(request.headers.get("authorization"))) {
    return jsonError(401, "Unauthorized");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError(400, "Content-Type must be application/json");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return jsonError(413, "Payload too large");
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return jsonError(400, "Failed to read request body");
  }

  if (Buffer.byteLength(rawText, "utf8") > MAX_BODY_BYTES) {
    return jsonError(413, "Payload too large");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawText) as unknown;
  } catch {
    return jsonError(400, "Malformed JSON");
  }

  const result = await publishKocaeliSnapshot(payload);
  if (!result.success) {
    return jsonError(result.status, result.error, result.details);
  }

  return NextResponse.json({
    success: true,
    snapshotVersion: result.snapshotVersion,
    publishedAt: result.publishedAt,
    dataAsOf: result.dataAsOf,
    object: result.object,
    ...(result.idempotent ? { idempotent: true } : {}),
  });
}

/**
 * Optional sanitized latest read for monitoring/tests.
 * No drafts, versions, or storage internals.
 */
export async function GET() {
  const result = await readLatestKocaeliSnapshot();
  if (!result.ok) {
    const status = result.reason === "missing" ? 404 : 503;
    return jsonError(
      status,
      result.reason === "missing"
        ? "No published snapshot"
        : "Snapshot unavailable"
    );
  }

  const body = JSON.stringify(result.snapshot);
  const etag = `"${Buffer.from(body).length.toString(16)}-${result.snapshot.snapshotVersion}"`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      ETag: etag,
    },
  });
}
