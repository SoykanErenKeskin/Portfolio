import "server-only";

import { z } from "zod";
import { getKocaeliSnapshot } from "@/lib/kocaeli-real-estate/get-snapshot";
import { getProfileConfig } from "@/lib/profile/config";
import { buildStaticEderFallback } from "@/lib/profile/fallback";
import { ederProfileSchema } from "@/lib/profile/schema";
import type { EderProfile, ProfileSourceStatus } from "@/lib/profile/types";

const publicEderAdapterSchema = ederProfileSchema.omit({
  latestMeaningfulUpdate: true,
}).extend({
  /** Filled by composer after GitHub activity resolution */
  latestMeaningfulUpdate: z.string().nullable(),
});

export type EderAdapterResult = {
  eder: EderProfile;
  source: ProfileSourceStatus;
};

function pickSnapshotUpdatedAt(data: {
  publishedAt?: string | null;
  dataAsOf?: string;
  generatedAt?: string;
}): string | null {
  const candidates = [data.publishedAt, data.dataAsOf, data.generatedAt];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim() && !Number.isNaN(Date.parse(value))) {
      return value;
    }
  }
  return null;
}

function sanitizePublicScope(scope: string | null): string | null {
  if (!scope) return null;
  const lower = scope.toLowerCase();
  if (lower.includes("global")) return "Global model";
  if (lower.includes("regional") || lower.includes("region")) return "Regional model";
  // Drop opaque internal identifiers rather than leaking them.
  if (/^[a-z0-9_]+$/i.test(scope) && scope.includes("_")) return "Model scope";
  return scope;
}

function mapLiveEder(): Promise<EderAdapterResult> {
  return (async () => {
    const config = getProfileConfig();
    try {
      const resolved = await getKocaeliSnapshot();
      const { data, source: snapshotSource } = resolved;

      const globalR2 =
        typeof data.globalMetrics?.r2 === "number" &&
        Number.isFinite(data.globalMetrics.r2)
          ? data.globalMetrics.r2
          : null;

      const snapshotUpdatedAt = pickSnapshotUpdatedAt(data);
      const modelVersion =
        (typeof data.snapshotVersion === "string" && data.snapshotVersion.trim()) ||
        (typeof data.model?.experimentId === "string" &&
          data.model.experimentId.trim()) ||
        null;

      const projectStatus =
        typeof data.model?.status === "string" && data.model.status.trim()
          ? data.model.status.trim()
          : null;

      const rawScope =
        typeof data.model?.scope === "string" && data.model.scope.trim()
          ? data.model.scope.trim()
          : null;
      // Public-safe label — do not surface internal geography / system ids.
      const scope = sanitizePublicScope(rawScope);

      const candidate = {
        projectName: "EDER" as const,
        description: config.eder.description,
        projectStatus,
        scope,
        globalR2,
        modelVersion,
        snapshotUpdatedAt,
        latestMeaningfulUpdate: snapshotUpdatedAt,
        isActive: Boolean(projectStatus) || snapshotSource === "live",
        viewProjectHref: config.eder.viewProjectHref,
        technicalOverviewHref: config.eder.technicalOverviewHref,
        sourcePrivate: config.eder.sourcePrivate,
      };

      const parsed = publicEderAdapterSchema.safeParse(candidate);
      if (!parsed.success) {
        return {
          eder: buildStaticEderFallback(),
          source: "fallback" as const,
        };
      }

      return {
        eder: parsed.data,
        source:
          snapshotSource === "live" ? ("ok" as const) : ("fallback" as const),
      };
    } catch {
      return {
        eder: buildStaticEderFallback(),
        source: "error" as const,
      };
    }
  })();
}

export async function loadEderProfile(): Promise<EderAdapterResult> {
  return mapLiveEder();
}
