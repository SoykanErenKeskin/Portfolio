export const SVG_WIDTH = 880;

export const FONT_SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

export const FONT_MONO =
  'ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace';

/** TheQuarox-derived palette (not site blue accent). */
export const COLORS = {
  bg: "#0a0c12",
  bgRaised: "#10141c",
  bgDeep: "#07090e",
  ink: "#ecf0f6",
  inkMuted: "#949cac",
  inkFaint: "#646c7c",
  coral: "#f05a6e",
  coralDim: "#c8465a",
  border: "#303440",
  borderSubtle: "#20262e",
} as const;

export const TYPE = {
  name: 36,
  section: 26,
  body: 22,
  bodySecondary: 20,
  label: 18,
  metric: 32,
} as const;

export const FORBIDDEN_PROVIDER_SNIPPETS = [
  "supabase",
  "vercel",
  "neon",
  "kocaeli_global",
] as const;
