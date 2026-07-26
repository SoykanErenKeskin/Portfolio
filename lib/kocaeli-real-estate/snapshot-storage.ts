import "server-only";

import { supabase } from "@/lib/db/supabase";
import {
  kocaeliSnapshotSchema,
  type KocaeliSnapshot,
} from "@/lib/kocaeli-real-estate/snapshot-schema";
import {
  KOCAELI_LATEST_OBJECT,
  KOCAELI_LATEST_LOGICAL_NAME,
  PORTFOLIO_SNAPSHOTS_BUCKET,
  kocaeliVersionObjectPath,
} from "@/lib/kocaeli-real-estate/snapshot-paths";

export type StorageReadResult =
  | { ok: true; snapshot: KocaeliSnapshot; etag?: string }
  | { ok: false; reason: "missing" | "invalid" | "error" };

async function downloadJsonObject(
  objectPath: string
): Promise<{ json: unknown; etag?: string } | null> {
  const { data, error } = await supabase.storage
    .from(PORTFOLIO_SNAPSHOTS_BUCKET)
    .download(objectPath);

  if (error || !data) {
    return null;
  }

  const text = await data.text();
  try {
    return { json: JSON.parse(text) as unknown };
  } catch {
    return null;
  }
}

export async function readLatestKocaeliSnapshot(): Promise<StorageReadResult> {
  try {
    const downloaded = await downloadJsonObject(KOCAELI_LATEST_OBJECT);
    if (!downloaded) {
      return { ok: false, reason: "missing" };
    }
    const parsed = kocaeliSnapshotSchema.safeParse(downloaded.json);
    if (!parsed.success) {
      return { ok: false, reason: "invalid" };
    }
    return { ok: true, snapshot: parsed.data };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function uploadSnapshotObject(
  objectPath: string,
  body: Buffer,
  opts?: { upsert?: boolean }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.storage
    .from(PORTFOLIO_SNAPSHOTS_BUCKET)
    .upload(objectPath, body, {
      contentType: "application/json",
      upsert: opts?.upsert ?? true,
      cacheControl: "60",
    });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function writeVersionedSnapshot(
  snapshotVersion: string,
  body: Buffer
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  const path = kocaeliVersionObjectPath(snapshotVersion);
  const result = await uploadSnapshotObject(path, body, { upsert: true });
  if (!result.ok) return result;
  return { ok: true, path };
}

export async function writeLatestSnapshot(
  body: Buffer
): Promise<{ ok: true } | { ok: false; message: string }> {
  return uploadSnapshotObject(KOCAELI_LATEST_OBJECT, body, { upsert: true });
}

/** Re-download versioned object and validate schema after write. */
export async function verifyVersionedObject(
  snapshotVersion: string
): Promise<StorageReadResult> {
  const path = kocaeliVersionObjectPath(snapshotVersion);
  try {
    const downloaded = await downloadJsonObject(path);
    if (!downloaded) return { ok: false, reason: "missing" };
    const parsed = kocaeliSnapshotSchema.safeParse(downloaded.json);
    if (!parsed.success) return { ok: false, reason: "invalid" };
    return { ok: true, snapshot: parsed.data };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export function logicalLatestName(): string {
  return KOCAELI_LATEST_LOGICAL_NAME;
}
