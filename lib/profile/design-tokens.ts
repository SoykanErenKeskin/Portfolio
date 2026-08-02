/**
 * Shared Profile Experience visual tokens.
 * Source of truth for React preview (CSS mirrors these) and SVG generators.
 * Values match `.profile-experience` in app/globals.css.
 */

/** RGB channel triplets matching CSS `--gp-*` custom properties. */
export const GP_RGB = {
  bg: [10, 12, 18],
  bgRaised: [16, 18, 26],
  bgDeep: [8, 9, 14],
  border: [48, 52, 64],
  borderSubtle: [32, 36, 46],
  ink: [236, 240, 246],
  inkMuted: [148, 156, 172],
  inkFaint: [100, 108, 124],
  coral: [240, 90, 110],
  coralSoft: [200, 70, 90],
} as const;

function rgbHex(channels: readonly [number, number, number]): string {
  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Hex colors for SVG / non-CSS consumers. */
export const GP_COLOR = {
  bg: rgbHex(GP_RGB.bg),
  bgRaised: rgbHex(GP_RGB.bgRaised),
  bgDeep: rgbHex(GP_RGB.bgDeep),
  border: rgbHex(GP_RGB.border),
  borderSubtle: rgbHex(GP_RGB.borderSubtle),
  ink: rgbHex(GP_RGB.ink),
  inkMuted: rgbHex(GP_RGB.inkMuted),
  inkFaint: rgbHex(GP_RGB.inkFaint),
  coral: rgbHex(GP_RGB.coral),
  coralSoft: rgbHex(GP_RGB.coralSoft),
  canvasEnd: "#0e1018",
} as const;

export const GP_OPACITY = {
  panelBorder: 0.75,
  panelFill: 0.92,
  panelActiveBorder: 0.45,
  panelActiveGlow: 0.35,
  coralSoftBorder: 0.35,
  iconPlateBorder: 0.28,
  iconPlateGlow: 0.35,
  watermark: 0.06,
  flowLineMin: 0.12,
  flowLineMax: 0.55,
  insetHighlight: 0.04,
  radialGlow: 0.1,
} as const;

export const GP_SPACE = {
  sectionGap: 56,
  cardPad: 20,
  cardPadLg: 24,
  rowGap: 12,
  moduleGap: 8,
  safeBottom: 28,
  outerInset: 16,
} as const;

export const GP_CUT = {
  lg: 14,
  sm: 8,
} as const;

/** Named type scale (px) — SVG uses system fonts at these sizes. */
export const GP_TYPE = {
  eyebrow: 11,
  label: 12,
  bodySm: 14,
  body: 16,
  bodyLg: 18,
  title: 22,
  section: 28,
  name: 36,
  metric: 30,
  mark: 11,
} as const;

export const GP_TRACKING = {
  eyebrow: "0.22em",
  label: "0.16em",
  monoTight: "0.12em",
} as const;

export const SVG_CANVAS = {
  width: 880,
  heroHeight: 480,
  workMinHeight: 1340,
  systemMinHeight: 920,
} as const;
