import "server-only";

import { unstable_cache } from "next/cache";
import { KOCAELI_SNAPSHOT_CACHE_TAG } from "@/lib/kocaeli-real-estate/snapshot-paths";
import { loadEderProfile } from "@/lib/profile/adapters/eder";
import { loadGitHubProfileActivity } from "@/lib/profile/adapters/github";
import {
  buildMeaningfulActivity,
  toActivityGroups,
} from "@/lib/profile/activity";
import { getProfileConfig } from "@/lib/profile/config";
import {
  buildFullStaticFallback,
  buildStaticProjects,
} from "@/lib/profile/fallback";
import { profileDataSchema } from "@/lib/profile/schema";
import type { EderProfile, ProfileData } from "@/lib/profile/types";

export const PROFILE_DATA_CACHE_TAG = "profile-data";

function resolveLatestMeaningfulUpdate(
  ederLinkedActivityTimestamps: string[],
  snapshotUpdatedAt: string | null
): string | null {
  let newest: string | null = null;
  let newestMs = -1;
  for (const ts of ederLinkedActivityTimestamps) {
    const ms = Date.parse(ts);
    if (!Number.isNaN(ms) && ms > newestMs) {
      newestMs = ms;
      newest = ts;
    }
  }
  if (newest) return newest;
  return snapshotUpdatedAt;
}

async function composeProfileData(): Promise<ProfileData> {
  const config = getProfileConfig();

  const [ederResult, githubResult] = await Promise.all([
    loadEderProfile(),
    loadGitHubProfileActivity(),
  ]);

  const meaningful = buildMeaningfulActivity(
    githubResult.commits,
    config.maxActivityEntries
  );
  const activity = toActivityGroups(meaningful);

  const ederRepoSlugs = new Set(
    (
      config.projectRepos.find((m) => m.projectId === "eder")?.repositories ??
      []
    ).map((s) => s.toLowerCase())
  );

  const ederActivityTimestamps = meaningful
    .filter((item) => item.projectId === "eder")
    .map((item) => item.sourceTimestamp);

  // Also consider commits from eder-linked repo names if mapping used activity
  if (ederRepoSlugs.size > 0) {
    for (const commit of githubResult.commits) {
      if (commit.projectId === "eder") {
        ederActivityTimestamps.push(commit.committedDate);
      }
    }
  }

  const latestMeaningfulUpdate = resolveLatestMeaningfulUpdate(
    ederActivityTimestamps,
    ederResult.eder.snapshotUpdatedAt
  );

  const eder: EderProfile = {
    ...ederResult.eder,
    latestMeaningfulUpdate,
  };

  const metricValue =
    eder.globalR2 == null || !Number.isFinite(eder.globalR2)
      ? null
      : eder.globalR2.toFixed(2);

  const projects = buildStaticProjects({
    metricValue,
    status: eder.projectStatus,
    latestMeaningfulUpdate: eder.latestMeaningfulUpdate,
  });

  const candidate: ProfileData = {
    version: config.version,
    generatedAt: new Date().toISOString(),
    identity: config.identity,
    eder,
    whatIBuild: config.whatIBuild,
    projects,
    activity,
    techMap: config.techMap,
    contact: config.contact,
    meta: {
      sources: {
        github: githubResult.source,
        eder: ederResult.source,
      },
    },
  };

  const parsed = profileDataSchema.safeParse(candidate);
  if (!parsed.success) {
    return buildFullStaticFallback({
      sources: {
        github: githubResult.source === "ok" ? "fallback" : githubResult.source,
        eder: ederResult.source === "ok" ? "fallback" : ederResult.source,
      },
    });
  }

  return parsed.data;
}

const getCachedProfileData = unstable_cache(
  async () => composeProfileData(),
  ["profile-data-v2"],
  {
    revalidate: 3600,
    tags: [PROFILE_DATA_CACHE_TAG, KOCAELI_SNAPSHOT_CACHE_TAG],
  }
);

/**
 * Single normalized entry point for admin preview, /api/profile/data, and future SVG routes.
 */
export async function getProfileData(): Promise<ProfileData> {
  try {
    return await getCachedProfileData();
  } catch {
    return buildFullStaticFallback({
      sources: { github: "error", eder: "error" },
    });
  }
}
