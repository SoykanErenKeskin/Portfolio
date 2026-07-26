import "server-only";

/** Private bucket for portfolio case snapshots (server-side read/write only). */
export const PORTFOLIO_SNAPSHOTS_BUCKET =
  process.env.PORTFOLIO_SNAPSHOTS_BUCKET?.trim() || "portfolio-snapshots";

export const KOCAELI_SNAPSHOT_PREFIX = "kocaeli-real-estate";

export const KOCAELI_LATEST_OBJECT = `${KOCAELI_SNAPSHOT_PREFIX}/latest.json`;

/** Logical name shown in API responses (not a signed URL). */
export const KOCAELI_LATEST_LOGICAL_NAME = "kocaeli-real-estate/latest.json";

/** Next.js cache tag — revalidated on successful publish. */
export const KOCAELI_SNAPSHOT_CACHE_TAG = "kocaeli-portfolio-snapshot";

export function kocaeliVersionObjectPath(snapshotVersion: string): string {
  const safe = snapshotVersion.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128);
  return `${KOCAELI_SNAPSHOT_PREFIX}/versions/${safe}.json`;
}
