import "server-only";

import { timingSafeEqual } from "crypto";

/**
 * Constant-time Bearer token check against PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN.
 * Never log or return the token.
 */
export function verifySnapshotPublishToken(
  authorizationHeader: string | null
): boolean {
  const expected = process.env.PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN?.trim();
  if (!expected) return false;

  if (!authorizationHeader?.startsWith("Bearer ")) return false;
  const provided = authorizationHeader.slice("Bearer ".length).trim();
  if (!provided) return false;

  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    // Still do a dummy compare to reduce length leak timing variance slightly
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}
