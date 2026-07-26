import "server-only";

import { unstable_cache } from "next/cache";
import fallbackJson from "@/content/cases/kocaeli-real-estate/fallback-snapshot.json";
import {
  kocaeliSnapshotSchema,
  type KocaeliSnapshot,
} from "@/lib/kocaeli-real-estate/snapshot-schema";
import { KOCAELI_SNAPSHOT_CACHE_TAG } from "@/lib/kocaeli-real-estate/snapshot-paths";
import { readLatestKocaeliSnapshot } from "@/lib/kocaeli-real-estate/snapshot-storage";

export type SnapshotSource = "live" | "fallback-reference";

export type ResolvedKocaeliSnapshot = {
  data: KocaeliSnapshot;
  source: SnapshotSource;
  /** Prefer publishedAt, then dataAsOf, then generatedAt for UI badge */
  asOf: string;
  snapshotVersion: string;
};

function asOfLabel(data: KocaeliSnapshot): string {
  return data.publishedAt ?? data.dataAsOf ?? data.generatedAt;
}

function loadFallback(): ResolvedKocaeliSnapshot {
  const parsed = kocaeliSnapshotSchema.safeParse({
    ...fallbackJson,
    source: "fallback-reference",
  });
  if (!parsed.success) {
    throw new Error(
      `Kocaeli fallback-reference snapshot failed schema validation: ${parsed.error.message}`
    );
  }
  const data: KocaeliSnapshot = {
    ...parsed.data,
    source: "fallback-reference",
    actualVsPredictedDensity: null,
  };
  return {
    data,
    source: "fallback-reference",
    asOf: asOfLabel(data),
    snapshotVersion: data.snapshotVersion,
  };
}

async function fetchLiveFromStorage(): Promise<KocaeliSnapshot | null> {
  const result = await readLatestKocaeliSnapshot();
  if (!result.ok) return null;
  return { ...result.snapshot, source: "live" };
}

const getCachedLiveSnapshot = unstable_cache(
  async () => fetchLiveFromStorage(),
  ["kocaeli-snapshot-latest-v1"],
  { revalidate: 60, tags: [KOCAELI_SNAPSHOT_CACHE_TAG] }
);

/**
 * Resolves public-safe snapshot from Supabase Storage
 * (`portfolio-snapshots/kocaeli-real-estate/latest.json`).
 * Invalid/missing live data never poisons the checked-in fallback-reference.
 * Density is never synthesized in fallback.
 */
export async function getKocaeliSnapshot(): Promise<ResolvedKocaeliSnapshot> {
  const fallback = loadFallback();

  try {
    const live = await getCachedLiveSnapshot();
    if (!live) return fallback;

    const parsed = kocaeliSnapshotSchema.safeParse(live);
    if (!parsed.success) return fallback;

    const data: KocaeliSnapshot = {
      ...parsed.data,
      source: "live",
    };

    return {
      data,
      source: "live",
      asOf: asOfLabel(data),
      snapshotVersion: data.snapshotVersion,
    };
  } catch {
    return fallback;
  }
}
