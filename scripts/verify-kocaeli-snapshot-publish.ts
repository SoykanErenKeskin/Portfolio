/**
 * Publish validation + auth + conflict smoke tests (no Storage / no network).
 * Run: npx tsx scripts/verify-kocaeli-snapshot-publish.ts
 */
import { timingSafeEqual } from "crypto";
import fallback from "../content/cases/kocaeli-real-estate/fallback-snapshot.json";
import {
  validateSnapshotForPublish,
  validateDensityForChart,
  kocaeliSnapshotSchema,
} from "../lib/kocaeli-real-estate/snapshot-schema";
import { isStaleAgainstLatest } from "../lib/kocaeli-real-estate/snapshot-freshness";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

function baseValid() {
  return {
    ...fallback,
    source: "live" as const,
    containsRowLevelData: false as const,
    snapshotVersion: "v-test-1",
    generatedAt: "2026-07-26T12:00:00.000Z",
    actualVsPredictedDensity: {
      targetName: "unit_price_gross",
      unit: "TL/m²",
      actualBinEdges: [0, 5000, 10000],
      predictedBinEdges: [0, 5000, 10000],
      cells: [{ actualBinIndex: 0, predictedBinIndex: 0, count: 12 }],
      suppression: { minCellCount: 5 },
    },
  };
}

// --- Auth shape (mirror publish-auth without importing server-only env path issues)
function verifyToken(header: string | null, expected: string): boolean {
  if (!expected) return false;
  if (!header?.startsWith("Bearer ")) return false;
  const provided = header.slice("Bearer ".length).trim();
  if (!provided) return false;
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

assert(verifyToken(null, "secret") === false, "no token rejected");
assert(verifyToken("Bearer wrong", "secret") === false, "wrong token rejected");
assert(verifyToken("Bearer secret", "secret") === true, "correct token ok");

// --- Publish validation
assert(
  validateSnapshotForPublish(fallback).ok === false,
  "fallback without containsRowLevelData:false rejected for publish"
);

const missingFlag = { ...baseValid() };
delete (missingFlag as { containsRowLevelData?: boolean }).containsRowLevelData;
assert(
  validateSnapshotForPublish(missingFlag).ok === false,
  "missing containsRowLevelData rejected"
);

const wrongUnit = baseValid();
wrongUnit.actualVsPredictedDensity.unit = "TL";
assert(validateSnapshotForPublish(wrongUnit).ok === false, "TL unit rejected");

const wrongTarget = baseValid();
wrongTarget.actualVsPredictedDensity.targetName = "total_price";
assert(
  validateSnapshotForPublish(wrongTarget).ok === false,
  "wrong target rejected"
);

const withPii = {
  ...baseValid(),
  listings: [{ listing_id: "x", title: "secret listing", lat: 40.7, lon: 29.9 }],
};
assert(validateSnapshotForPublish(withPii).ok === false, "PII fields rejected");

const rowLevel = {
  ...baseValid(),
  points: [
    { actual: 10000, predicted: 9000 },
    { actual: 12000, predicted: 11000 },
  ],
};
assert(
  validateSnapshotForPublish(rowLevel).ok === false,
  "row-level actual/predicted rejected"
);

const noSuppression = baseValid();
delete (noSuppression.actualVsPredictedDensity as { suppression?: unknown })
  .suppression;
assert(
  validateSnapshotForPublish(noSuppression).ok === false,
  "missing suppression rejected"
);

const good = baseValid();
const ok = validateSnapshotForPublish(good);
assert(ok.ok === true, "valid publish payload accepted");
if (ok.ok) {
  assert(
    validateDensityForChart(ok.snapshot).ok === true,
    "valid density usable on case page"
  );
}

// --- Conflict / idempotency
assert(
  isStaleAgainstLatest(
    { snapshotVersion: "a", generatedAt: "2026-01-01T00:00:00.000Z" },
    { snapshotVersion: "a", generatedAt: "2026-01-01T00:00:00.000Z" }
  ) === "idempotent",
  "same version idempotent"
);
assert(
  isStaleAgainstLatest(
    { snapshotVersion: "old", generatedAt: "2026-01-01T00:00:00.000Z" },
    { snapshotVersion: "new", generatedAt: "2026-06-01T00:00:00.000Z" }
  ) === "stale",
  "older generatedAt is stale"
);
assert(
  isStaleAgainstLatest(
    { snapshotVersion: "new", generatedAt: "2026-07-01T00:00:00.000Z" },
    { snapshotVersion: "old", generatedAt: "2026-01-01T00:00:00.000Z" }
  ) === "newer",
  "newer generatedAt allowed"
);

// Fallback still schema-valid for case page (not publish)
assert(
  kocaeliSnapshotSchema.safeParse({
    ...fallback,
    source: "fallback-reference",
  }).success,
  "fallback remains readable"
);
assert(
  validateDensityForChart(
    kocaeliSnapshotSchema.parse({
      ...fallback,
      source: "fallback-reference",
      actualVsPredictedDensity: null,
    })
  ).ok === false,
  "fallback density empty"
);

// Client-bundle guard: service role must not appear in public-facing module strings we ship as client
// (spot-check publish route is server-only via runtime nodejs + no NEXT_PUBLIC token name)
assert(
  !("NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN" in process.env) ||
    !process.env.NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_PUBLISH_TOKEN,
  "no NEXT_PUBLIC publish token"
);

console.log("verify-kocaeli-snapshot-publish: all checks passed");
