import { getProfileConfig } from "@/lib/profile/config";
import type { EderProfile, FeaturedProject, ProfileData } from "@/lib/profile/types";

export function buildStaticEderFallback(): EderProfile {
  const config = getProfileConfig();
  return {
    projectName: "EDER",
    description: config.eder.description,
    projectStatus: null,
    scope: null,
    globalR2: null,
    modelVersion: null,
    snapshotUpdatedAt: null,
    latestMeaningfulUpdate: null,
    isActive: false,
    viewProjectHref: config.eder.viewProjectHref,
    technicalOverviewHref: config.eder.technicalOverviewHref,
    sourcePrivate: config.eder.sourcePrivate,
  };
}

export function buildStaticProjects(
  ederOverlay?: Partial<
    Pick<
      FeaturedProject,
      "metricValue" | "status" | "latestMeaningfulUpdate"
    >
  >
): FeaturedProject[] {
  const config = getProfileConfig();
  return config.projects.map((p) => {
    if (p.id === "eder") {
      return {
        ...p,
        metricValue: ederOverlay?.metricValue ?? null,
        status: ederOverlay?.status ?? null,
        latestMeaningfulUpdate: ederOverlay?.latestMeaningfulUpdate ?? null,
      };
    }
    return {
      ...p,
      metricValue: null,
      status: null,
      latestMeaningfulUpdate: null,
    };
  });
}

/** Layout-safe ProfileData when composers fail validation catastrophically. */
export function buildFullStaticFallback(meta: ProfileData["meta"]): ProfileData {
  const config = getProfileConfig();
  return {
    version: config.version,
    generatedAt: new Date().toISOString(),
    identity: config.identity,
    eder: buildStaticEderFallback(),
    whatIBuild: config.whatIBuild,
    projects: buildStaticProjects(),
    activity: [],
    techMap: config.techMap,
    contact: config.contact,
    meta,
  };
}
