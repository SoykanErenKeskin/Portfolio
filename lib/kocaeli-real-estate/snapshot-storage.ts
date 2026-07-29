import "server-only";

import {
  kocaeliSnapshotSchema,
  type KocaeliSnapshot,
} from "@/lib/kocaeli-real-estate/snapshot-schema";
import {
  KOCAELI_LATEST_LOGICAL_NAME,
  resolveLatestSnapshotPublicUrl,
} from "@/lib/kocaeli-real-estate/snapshot-paths";

export type StorageReadResult =
  | { ok: true; snapshot: KocaeliSnapshot }
  | { ok: false; reason: "missing" | "invalid" | "error" | "unconfigured" };

/**
 * Read latest.json via public HTTPS (no service role on the website).
 * Dashboard alone writes to the bucket with its own service role.
 */
export async function readLatestKocaeliSnapshot(): Promise<StorageReadResult> {
  const url = resolveLatestSnapshotPublicUrl();
  if (!url) {
    return { ok: false, reason: "unconfigured" };
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (res.status === 404) {
      return { ok: false, reason: "missing" };
    }
    if (!res.ok) {
      return { ok: false, reason: "error" };
    }

    const json: unknown = await res.json();
    const parsed = kocaeliSnapshotSchema.safeParse(json);
    if (!parsed.success) {
      return { ok: false, reason: "invalid" };
    }

    return { ok: true, snapshot: parsed.data };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export function logicalLatestName(): string {
  return KOCAELI_LATEST_LOGICAL_NAME;
}
