import {
  GP_COLOR,
  GP_TYPE,
  SVG_CANVAS,
} from "@/lib/profile/design-tokens";

export const SVG_WIDTH = SVG_CANVAS.width;

export const FONT_SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

export const FONT_MONO =
  'ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace';

/** Alias of shared GP_COLOR for SVG generators. */
export const COLORS = {
  bg: GP_COLOR.bg,
  bgRaised: GP_COLOR.bgRaised,
  bgDeep: GP_COLOR.bgDeep,
  ink: GP_COLOR.ink,
  inkMuted: GP_COLOR.inkMuted,
  inkFaint: GP_COLOR.inkFaint,
  coral: GP_COLOR.coral,
  coralDim: GP_COLOR.coralSoft,
  border: GP_COLOR.border,
  borderSubtle: GP_COLOR.borderSubtle,
} as const;

export const TYPE = {
  name: GP_TYPE.name,
  section: GP_TYPE.section,
  body: GP_TYPE.bodyLg,
  bodySecondary: GP_TYPE.body,
  label: GP_TYPE.label,
  metric: GP_TYPE.metric,
  eyebrow: GP_TYPE.eyebrow,
  mark: GP_TYPE.mark,
} as const;

export const FORBIDDEN_PROVIDER_SNIPPETS = [
  "supabase",
  "vercel",
  "neon",
  "kocaeli_global",
] as const;
