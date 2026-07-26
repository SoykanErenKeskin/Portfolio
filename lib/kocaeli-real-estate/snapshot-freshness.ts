import type { KocaeliSnapshot } from "@/lib/kocaeli-real-estate/snapshot-schema";

function parseGeneratedAt(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : NaN;
}

/** Pure conflict check used by publish (and unit tests). */
export function isStaleAgainstLatest(
  incoming: Pick<KocaeliSnapshot, "snapshotVersion" | "generatedAt">,
  latest: Pick<KocaeliSnapshot, "snapshotVersion" | "generatedAt">
): "idempotent" | "stale" | "newer" {
  if (incoming.snapshotVersion === latest.snapshotVersion) {
    return "idempotent";
  }
  const incomingTs = parseGeneratedAt(incoming.generatedAt);
  const currentTs = parseGeneratedAt(latest.generatedAt);
  if (
    Number.isFinite(incomingTs) &&
    Number.isFinite(currentTs) &&
    incomingTs < currentTs
  ) {
    return "stale";
  }
  return "newer";
}
