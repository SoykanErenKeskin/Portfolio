/**
 * Smoke checks for Kocaeli snapshot schema / density semantics.
 * Run: npx tsx scripts/verify-kocaeli-snapshot.ts
 */
import fallback from "../content/cases/kocaeli-real-estate/fallback-snapshot.json";
import {
  kocaeliSnapshotSchema,
  validateDensityForChart,
  resolveCountyChartMode,
  validateSnapshotForPublish,
} from "../lib/kocaeli-real-estate/snapshot-schema";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const fb = kocaeliSnapshotSchema.parse({
  ...fallback,
  source: "fallback-reference",
});
assert(fb.actualVsPredictedDensity == null, "fallback must not ship density");
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
assert(
  validateSnapshotForPublish(wrongUnit).ok === false,
  "publish rejects TL unit"
);

const wrongTarget = {
  ...fb,
  containsRowLevelData: false as const,
  actualVsPredictedDensity: {
    targetName: "total_price",
    unit: "TL/m²",
    actualBinEdges: [0, 10000],
    predictedBinEdges: [0, 10000],
    cells: [{ actualBinIndex: 0, predictedBinIndex: 0, count: 10 }],
    suppression: { minCellCount: 3 },
  },
};
assert(
  validateDensityForChart(wrongTarget as typeof fb).ok === false,
  "wrong targetName must be rejected"
);

const good = {
  ...fb,
  containsRowLevelData: false as const,
  actualVsPredictedDensity: {
    targetName: "unit_price_gross",
    unit: "TL/m²",
    actualBinEdges: [0, 5000, 10000],
    predictedBinEdges: [0, 5000, 10000],
    cells: [
      { actualBinIndex: 0, predictedBinIndex: 0, count: 5 },
      { actualBinIndex: 1, predictedBinIndex: 1, density: 0.2 },
    ],
    suppression: { minCellCount: 3 },
  },
};
assert(validateDensityForChart(good as typeof fb).ok === true, "valid density");
assert(validateSnapshotForPublish(good).ok === true, "valid publish");

console.log("verify-kocaeli-snapshot: all checks passed");
