import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  normalizeSnapshotForStorage,
  snapshotJsonBytes,
  validateSnapshotForPublish,
  type KocaeliSnapshot,
} from "@/lib/kocaeli-real-estate/snapshot-schema";
import { isStaleAgainstLatest } from "@/lib/kocaeli-real-estate/snapshot-freshness";
import { KOCAELI_SNAPSHOT_CACHE_TAG } from "@/lib/kocaeli-real-estate/snapshot-paths";
import {
  logicalLatestName,
  readLatestKocaeliSnapshot,
  verifyVersionedObject,
  writeLatestSnapshot,
  writeVersionedSnapshot,
} from "@/lib/kocaeli-real-estate/snapshot-storage";

export { KOCAELI_SNAPSHOT_CACHE_TAG };
export { isStaleAgainstLatest } from "@/lib/kocaeli-real-estate/snapshot-freshness";

export type PublishSuccess = {
  success: true;
  snapshotVersion: string;
  publishedAt: string;
  dataAsOf: string;
  object: string;
  idempotent?: boolean;
};

export type PublishFailure = {
  success: false;
  status: number;
  error: string;
  details?: string[];
};

function revalidateCasePages(): void {
  try {
    revalidateTag(KOCAELI_SNAPSHOT_CACHE_TAG);
  } catch {
    // ignore outside Next request context
  }
  try {
    revalidatePath("/en/projects/kocaeli-real-estate");
    revalidatePath("/tr/projects/kocaeli-real-estate");
  } catch {
    // ignore
  }
}

/**
 * Validate → versioned write → verify → latest upsert.
 * On latest failure, previous latest remains.
 */
export async function publishKocaeliSnapshot(
  raw: unknown
): Promise<PublishSuccess | PublishFailure> {
  const validated = validateSnapshotForPublish(raw);
  if (!validated.ok) {
    return {
      success: false,
      status: validated.status,
      error: validated.error,
      details: validated.details,
    };
  }

  const publishedAt = new Date().toISOString();
  const normalized = normalizeSnapshotForStorage(
    validated.snapshot,
    publishedAt
  );
  const body = snapshotJsonBytes(normalized);

  const existing = await readLatestKocaeliSnapshot();

  if (existing.ok) {
    const current = existing.snapshot;
    const freshness = isStaleAgainstLatest(normalized, current);
    if (freshness === "idempotent") {
      revalidateCasePages();
      return {
        success: true,
        snapshotVersion: current.snapshotVersion,
        publishedAt: current.publishedAt ?? current.generatedAt,
        dataAsOf: current.dataAsOf,
        object: logicalLatestName(),
        idempotent: true,
      };
    }
    if (freshness === "stale") {
      return {
        success: false,
        status: 409,
        error:
          "Stale snapshot: generatedAt is older than the current latest snapshot",
        details: [
          `incoming.generatedAt=${normalized.generatedAt}`,
          `latest.generatedAt=${current.generatedAt}`,
          `latest.snapshotVersion=${current.snapshotVersion}`,
        ],
      };
    }
  }

  const versioned = await writeVersionedSnapshot(
    normalized.snapshotVersion,
    body
  );
  if (!versioned.ok) {
    return {
      success: false,
      status: 503,
      error: "Failed to write versioned snapshot",
    };
  }

  const verified = await verifyVersionedObject(normalized.snapshotVersion);
  if (!verified.ok) {
    return {
      success: false,
      status: 503,
      error: "Versioned snapshot failed post-write validation",
    };
  }

  const latest = await writeLatestSnapshot(body);
  if (!latest.ok) {
    return {
      success: false,
      status: 503,
      error:
        "Failed to update latest.json; previous latest retained if present",
    };
  }

  revalidateCasePages();

  return {
    success: true,
    snapshotVersion: normalized.snapshotVersion,
    publishedAt,
    dataAsOf: normalized.dataAsOf,
    object: logicalLatestName(),
  };
}

export type { KocaeliSnapshot };
