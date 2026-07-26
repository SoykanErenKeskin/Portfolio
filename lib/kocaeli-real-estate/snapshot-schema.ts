import { z } from "zod";

/** Canonical target for the density chart — total TL prices are rejected. */
export const DENSITY_TARGET_NAME = "unit_price_gross";
export const DENSITY_UNIT = "TL/m²";

const localizedNoteSchema = z.object({
  en: z.string(),
  tr: z.string(),
});

const densityCellSchema = z.object({
  actualBinIndex: z.number().int().nonnegative(),
  predictedBinIndex: z.number().int().nonnegative(),
  count: z.number().nonnegative().optional(),
  density: z.number().nonnegative().optional(),
});

const densitySchema = z
  .object({
    targetName: z.string(),
    unit: z.string(),
    scale: z.number().positive().optional(),
    actualBinEdges: z.array(z.number()).min(2),
    predictedBinEdges: z.array(z.number()).min(2),
    cells: z.array(densityCellSchema).min(1),
    suppression: z
      .object({
        minCellCount: z.number().int().nonnegative().optional(),
        notes: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (val.targetName !== DENSITY_TARGET_NAME) {
      ctx.addIssue({
        code: "custom",
        message: `density targetName must be ${DENSITY_TARGET_NAME}`,
        path: ["targetName"],
      });
    }
    if (val.unit !== DENSITY_UNIT) {
      ctx.addIssue({
        code: "custom",
        message: `density unit must be ${DENSITY_UNIT}`,
        path: ["unit"],
      });
    }
    for (const edge of [...val.actualBinEdges, ...val.predictedBinEdges]) {
      if (!Number.isFinite(edge)) {
        ctx.addIssue({
          code: "custom",
          message: "bin edges must be finite",
          path: ["actualBinEdges"],
        });
        break;
      }
    }
    for (const cell of val.cells) {
      if (cell.count == null && cell.density == null) {
        ctx.addIssue({
          code: "custom",
          message: "each density cell needs count or density",
          path: ["cells"],
        });
        break;
      }
      if (cell.count != null && !Number.isFinite(cell.count)) {
        ctx.addIssue({
          code: "custom",
          message: "cell count must be finite",
          path: ["cells"],
        });
        break;
      }
      if (cell.density != null && !Number.isFinite(cell.density)) {
        ctx.addIssue({
          code: "custom",
          message: "cell density must be finite",
          path: ["cells"],
        });
        break;
      }
    }
  });

const countyVolumeSchema = z.object({
  county: z.string().min(1),
  sale: z.number().nonnegative(),
  rental: z.number().nonnegative(),
});

const countyEvalSchema = z.object({
  county: z.string().min(1),
  r2: z.number(),
  mape: z.number(),
});

/** Canonical public-safe snapshot contract (producer-independent). */
export const kocaeliSnapshotSchema = z.object({
  schemaVersion: z.number().int().positive(),
  snapshotVersion: z.string().min(1).max(128),
  source: z.enum(["live", "fallback-reference"]).optional(),
  generatedAt: z.string().min(1),
  publishedAt: z.string().nullable().optional(),
  dataAsOf: z.string().min(1),
  /** Must be false on published payloads; omitted only on checked-in fallback. */
  containsRowLevelData: z.literal(false).optional(),
  model: z.object({
    experimentId: z.string().min(1),
    scope: z.string().min(1),
    status: z.string().optional(),
  }),
  globalMetrics: z.object({
    r2: z.number(),
    mape: z.number(),
    varianceRatio: z.number(),
    evaluationRows: z.number().int().positive(),
    leakagePass: z.boolean(),
  }),
  referenceMetrics: z
    .object({
      experimentId: z.string(),
      label: z.string().optional(),
      r2: z.number(),
      mape: z.number(),
      varianceRatio: z.number(),
    })
    .optional(),
  deltaVsReference: z
    .object({
      r2: z.number(),
      mape: z.number(),
      varianceRatioImproved: z.boolean().optional(),
    })
    .optional(),
  dataset: z.object({
    saleTotal: z.number().int().nonnegative(),
    rentalTotal: z.number().int().nonnegative(),
    scopeNote: z.string().optional(),
    counties: z.array(countyVolumeSchema).min(1),
    countyBreakdownScope: z
      .enum(["same-scope", "approximate-reference", "filtered"])
      .optional(),
    countyCoverageNote: localizedNoteSchema.optional(),
  }),
  countyEvaluation: z.array(countyEvalSchema).optional(),
  audit: z
    .object({
      severeMergeWarnings: z.number().int().nonnegative(),
      possibleBadMerges: z.number().int().nonnegative(),
      possibleBadMergesNote: z.string().optional(),
    })
    .optional(),
  actualVsPredictedDensity: densitySchema.nullable().optional(),
});

export type KocaeliSnapshot = z.infer<typeof kocaeliSnapshotSchema>;
export type KocaeliDensity = z.infer<typeof densitySchema>;

export type DensityValidation =
  | { ok: true; density: KocaeliDensity }
  | { ok: false; reason: string };

/** Semantic gate: wrong unit (e.g. total TL) must fail — never silent accept. */
export function validateDensityForChart(
  snapshot: KocaeliSnapshot
): DensityValidation {
  const raw = snapshot.actualVsPredictedDensity;
  if (raw == null) {
    return { ok: false, reason: "missing" };
  }
  const parsed = densitySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, density: parsed.data };
}

export type CountyChartMode =
  | { mode: "aligned" }
  | { mode: "explained"; note: { en: string; tr: string } }
  | { mode: "approximate"; note?: { en: string; tr: string } };

export function resolveCountyChartMode(
  snapshot: KocaeliSnapshot
): CountyChartMode {
  const {
    saleTotal,
    rentalTotal,
    counties,
    countyCoverageNote,
    countyBreakdownScope,
  } = snapshot.dataset;
  const saleSum = counties.reduce((s, c) => s + c.sale, 0);
  const rentalSum = counties.reduce((s, c) => s + c.rental, 0);
  const aligned = saleSum === saleTotal && rentalSum === rentalTotal;

  if (aligned) {
    return { mode: "aligned" };
  }

  if (countyCoverageNote) {
    return { mode: "explained", note: countyCoverageNote };
  }

  if (
    countyBreakdownScope === "approximate-reference" ||
    countyBreakdownScope === "filtered"
  ) {
    return { mode: "approximate" };
  }

  return { mode: "approximate" };
}

/** Keys / substrings that must never appear in a public-safe snapshot. */
const FORBIDDEN_KEY_PATTERN =
  /^(listing[_-]?id|listingid|title|description|address|address[_-]?text|site[_-]?name|sitename|latitude|longitude|lat|lon|lng|token|secret|password|api[_-]?key|service[_-]?role|connection[_-]?string|database[_-]?url|neon|private[_-]?key|auth[_-]?token|access[_-]?token)$/i;

const FORBIDDEN_PATH_HINT =
  /(listing[_-]?id|address_text|site_name|lat\/lon|latitude|longitude|service.?role|database|neon:\/\/|\.env)/i;

export type PublishValidationResult =
  | { ok: true; snapshot: KocaeliSnapshot }
  | { ok: false; status: 422; error: string; details?: string[] };

function collectForbiddenKeys(
  value: unknown,
  path: string,
  hits: string[]
): void {
  if (value == null) return;
  if (Array.isArray(value)) {
    // Row-level actual/predicted pairs (not aggregate bins)
    if (
      value.length > 0 &&
      value.every(
        (row) =>
          row &&
          typeof row === "object" &&
          !Array.isArray(row) &&
          "actual" in row &&
          "predicted" in row &&
          !("actualBinIndex" in row)
      )
    ) {
      hits.push(`${path}: row-level actual/predicted pairs`);
    }
    value.forEach((item, i) =>
      collectForbiddenKeys(item, `${path}[${i}]`, hits)
    );
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const child = path ? `${path}.${k}` : k;
      if (FORBIDDEN_KEY_PATTERN.test(k)) {
        hits.push(child);
      }
      if (k === "points" || k === "listings" || k === "rows") {
        hits.push(child);
      }
      collectForbiddenKeys(v, child, hits);
    }
  }
}

function assertFiniteMetrics(snapshot: KocaeliSnapshot, errors: string[]): void {
  const { r2, mape, varianceRatio, evaluationRows } = snapshot.globalMetrics;
  for (const [name, n] of [
    ["r2", r2],
    ["mape", mape],
    ["varianceRatio", varianceRatio],
    ["evaluationRows", evaluationRows],
  ] as const) {
    if (!Number.isFinite(n)) errors.push(`globalMetrics.${name} must be finite`);
  }
  if (r2 < -0.5 || r2 > 1.5) errors.push("globalMetrics.r2 out of plausible range");
  if (mape < 0 || mape > 5) errors.push("globalMetrics.mape out of plausible range");
  if (varianceRatio < 0 || varianceRatio > 5) {
    errors.push("globalMetrics.varianceRatio out of plausible range");
  }
  if (!Number.isFinite(Date.parse(snapshot.generatedAt))) {
    errors.push("generatedAt must be a parseable date");
  }
}

/**
 * Full publish gate: Zod + privacy + semantic density + no row-level data.
 * Does not mutate storage.
 */
export function validateSnapshotForPublish(
  raw: unknown
): PublishValidationResult {
  const parsed = kocaeliSnapshotSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      error: "Schema validation failed",
      details: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`
      ),
    };
  }

  const snapshot = parsed.data;
  const errors: string[] = [];

  if (snapshot.containsRowLevelData !== false) {
    errors.push("containsRowLevelData must be false");
  }

  assertFiniteMetrics(snapshot, errors);

  const density = snapshot.actualVsPredictedDensity;
  if (density != null) {
    if (density.targetName !== DENSITY_TARGET_NAME) {
      errors.push(`density targetName must be ${DENSITY_TARGET_NAME}`);
    }
    if (density.unit !== DENSITY_UNIT) {
      errors.push(`density unit must be ${DENSITY_UNIT}`);
    }
    if (
      density.suppression == null ||
      density.suppression.minCellCount == null
    ) {
      errors.push(
        "actualVsPredictedDensity.suppression.minCellCount is required"
      );
    }
  }

  const hits: string[] = [];
  collectForbiddenKeys(raw, "", hits);
  if (hits.length) {
    errors.push(`Forbidden fields: ${hits.slice(0, 12).join(", ")}`);
  }

  // String scan for path/secret hints in leaf strings (bounded)
  const jsonStr = JSON.stringify(raw);
  if (FORBIDDEN_PATH_HINT.test(jsonStr) && /neon:\/\/|service_role|eyJ[A-Za-z0-9_-]{20,}/.test(jsonStr)) {
    errors.push("Payload appears to contain secrets or internal connection data");
  }

  if (errors.length) {
    return { ok: false, status: 422, error: "Privacy/semantic validation failed", details: errors };
  }

  return { ok: true, snapshot };
}

/** Canonical JSON for storage (stable key order via stringify of normalized object). */
export function normalizeSnapshotForStorage(
  snapshot: KocaeliSnapshot,
  publishedAt: string
): KocaeliSnapshot {
  return {
    ...snapshot,
    source: "live",
    containsRowLevelData: false,
    publishedAt,
  };
}

export function snapshotJsonBytes(snapshot: KocaeliSnapshot): Buffer {
  return Buffer.from(JSON.stringify(snapshot), "utf8");
}
