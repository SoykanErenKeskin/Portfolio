/** Storage layout for the Kocaeli public-safe snapshot (dashboard writes; site reads). */

export const PORTFOLIO_SNAPSHOTS_BUCKET =
  process.env.PORTFOLIO_SNAPSHOTS_BUCKET?.trim() || "portfolio-snapshots";

export const KOCAELI_SNAPSHOT_PREFIX =
  process.env.PORTFOLIO_SNAPSHOT_STORAGE_PREFIX?.trim() || "kocaeli-real-estate";

export const KOCAELI_LATEST_OBJECT = `${KOCAELI_SNAPSHOT_PREFIX}/latest.json`;

export const KOCAELI_LATEST_LOGICAL_NAME = `${KOCAELI_SNAPSHOT_PREFIX}/latest.json`;

/** Cache tag for unstable_cache around latest.json fetch. */
export const KOCAELI_SNAPSHOT_CACHE_TAG = "kocaeli-portfolio-snapshot";

/**
 * Public HTTPS URL for latest.json (no service role).
 * Override with PORTFOLIO_SNAPSHOT_PUBLIC_URL if using CDN / custom path.
 */
export function resolveLatestSnapshotPublicUrl(): string | null {
  const override = process.env.PORTFOLIO_SNAPSHOT_PUBLIC_URL?.trim();
  if (override) {
    try {
      const u = new URL(override);
      if (u.protocol !== "https:") return null;
      return u.toString();
    } catch {
      return null;
    }
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!base) return null;
  try {
    const root = new URL(base);
    if (root.protocol !== "https:") return null;
    return `${root.origin}/storage/v1/object/public/${PORTFOLIO_SNAPSHOTS_BUCKET}/${KOCAELI_LATEST_OBJECT}`;
  } catch {
    return null;
  }
}
