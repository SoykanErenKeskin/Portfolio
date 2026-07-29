/**
 * Smoke checks for Kocaeli snapshot schema / density / listingGrowth.
 * Run: npx tsx scripts/verify-kocaeli-snapshot.ts
 */
import fallback from "../content/cases/kocaeli-real-estate/fallback-snapshot.json";
import {
  kocaeliSnapshotSchema,
  validateDensityForChart,
  resolveCountyChartMode,
  validatePublicSnapshot,
} from "../lib/kocaeli-real-estate/snapshot-schema";
import { resolveLatestSnapshotPublicUrl } from "../lib/kocaeli-real-estate/snapshot-paths";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const fb = kocaeliSnapshotSchema.parse({
  ...fallback,
  source: "fallback-reference",
});
assert(fb.actualVsPredictedDensity == null, "fallback must not ship density");
assert(fb.listingGrowth == null, "fallback listingGrowth must be null");
assert(
  validateDensityForChart(fb).ok === false,
  "fallback density must be empty state"
);
assert(
  resolveCountyChartMode(fb).mode === "explained",
  "fallback county mismatch must be explained"
);

const wrongUnit = {
  ...fb,
  containsRowLevelData: false as const,
  actualVsPredictedDensity: {
    targetName: "unit_price_gross",
    unit: "TL",
    actualBinEdges: [0, 10000],
    predictedBinEdges: [0, 10000],
    cells: [{ actualBinIndex: 0, predictedBinIndex: 0, count: 10 }],
    suppression: { minCellCount: 3 },
  },
};
assert(
  validateDensityForChart(wrongUnit as typeof fb).ok === false,
  "TL (total) unit must be rejected"
);

const withGrowth = {
  ...fb,
  containsRowLevelData: false as const,
  listingGrowth: {
    timezone: "Europe/Istanbul",
    basis: "saved_at",
    scope: "Kocaeli",
    firstListingDate: "2024-01-01",
    lastListingDate: "2024-01-03",
    last30Days: [
      { date: "2024-01-01", sale: 2, rental: 1, total: 3 },
      { date: "2024-01-02", sale: 0, rental: 1, total: 1 },
      { date: "2024-01-03", sale: 4, rental: 2, total: 6 },
    ],
    allTimeCumulative: [
      {
        date: "2024-01-01",
        saleCumulative: 2,
        rentalCumulative: 1,
        totalCumulative: 3,
      },
      {
        date: "2024-01-03",
        saleCumulative: 6,
        rentalCumulative: 4,
        totalCumulative: 10,
      },
    ],
  },
};
assert(
  kocaeliSnapshotSchema.safeParse(withGrowth).success,
  "listingGrowth payload parses"
);
assert(validatePublicSnapshot(withGrowth).ok === true, "growth payload valid");

const nullGrowth = { ...fb, containsRowLevelData: false as const, listingGrowth: null };
assert(
  kocaeliSnapshotSchema.safeParse(nullGrowth).success,
  "listingGrowth null allowed"
);

// Public URL builder (no secrets)
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
const url = resolveLatestSnapshotPublicUrl();
assert(
  url ===
    "https://example.supabase.co/storage/v1/object/public/portfolio-snapshots/kocaeli-real-estate/latest.json",
  "public latest URL shape"
);
assert(
  !url?.includes("service_role"),
  "URL must not embed service role"
);

console.log("verify-kocaeli-snapshot: all checks passed");
