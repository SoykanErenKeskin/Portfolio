import { readFileSync } from "node:fs";
import path from "node:path";
import { COLORS, FONT_MONO, FONT_SANS } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";

const brandCache = new Map<string, string>();

/** Intrinsic pixel size of known brand PNGs (from file headers). */
export const BRAND_INTRINSIC = {
  "thequarox-logo.png": { w: 496, h: 81 },
  "eder-house.png": { w: 150, h: 150 },
  "quarox-nodes.png": { w: 1024, h: 1024 },
} as const;

export type BrandFile = keyof typeof BRAND_INTRINSIC;

export function brandDataUri(filename: BrandFile | string): string {
  const cached = brandCache.get(filename);
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "public", "brand", filename);
  const buf = readFileSync(filePath);
  const uri = `data:image/png;base64,${buf.toString("base64")}`;
  brandCache.set(filename, uri);
  return uri;
}

/**
 * Embed a brand PNG with preserved aspect ratio.
 * Pass either width or height; the other is derived from the intrinsic ratio.
 */
export function brandImage(opts: {
  file: BrandFile;
  x: number;
  y: number;
  width?: number;
  height?: number;
  opacity?: number;
  id?: string;
}): string {
  const intrinsic = BRAND_INTRINSIC[opts.file];
  const ratio = intrinsic.w / intrinsic.h;
  let w = opts.width;
  let h = opts.height;
  if (w != null && h == null) h = w / ratio;
  else if (h != null && w == null) w = h * ratio;
  else if (w != null && h != null) {
    // Prefer width; recompute height so we never stretch.
    h = w / ratio;
  } else {
    w = 64;
    h = w / ratio;
  }
  const href = brandDataUri(opts.file);
  const opacity =
    opts.opacity != null ? ` opacity="${opts.opacity}"` : "";
  const id = opts.id ? ` id="${escapeXml(opts.id)}"` : "";
  return `<image${id} href="${href}" x="${opts.x}" y="${opts.y}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" preserveAspectRatio="xMidYMid meet"${opacity}/>`;
}

export function formatSvgR2(value: number | null | undefined): {
  available: boolean;
  text: string;
} {
  if (value == null || Number.isNaN(value)) {
    return { available: false, text: "METRIC UNAVAILABLE" };
  }
  return { available: true, text: value.toFixed(2) };
}

/** Short date for SVG cards — e.g. "29 Jul 2026" */
export function formatSvgShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatSvgStatus(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Unavailable";
  const s = raw.trim().toLowerCase();
  if (s === "published") return "Published";
  if (s.includes("active")) return "Active development";
  if (s.includes("develop")) return "Active development";
  if (s === "unavailable" || s === "unknown") return "Unavailable";
  if (/^[a-z0-9_\-]+$/i.test(raw.trim()) && raw.trim().length <= 24) {
    return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1);
  }
  return "Unavailable";
}

export function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function textAttrs(opts: {
  x: number;
  y: number;
  size: number;
  fill?: string;
  mono?: boolean;
  weight?: number | string;
  anchor?: "start" | "middle" | "end";
  letterSpacing?: string;
  id?: string;
}): string {
  const font = opts.mono ? FONT_MONO : FONT_SANS;
  return [
    opts.id ? `id="${escapeXml(opts.id)}"` : "",
    `x="${opts.x}"`,
    `y="${opts.y}"`,
    `fill="${opts.fill ?? COLORS.ink}"`,
    `font-family="${escapeXml(font)}"`,
    `font-size="${opts.size}"`,
    opts.weight != null ? `font-weight="${opts.weight}"` : "",
    opts.anchor ? `text-anchor="${opts.anchor}"` : "",
    opts.letterSpacing ? `letter-spacing="${opts.letterSpacing}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Explicit multi-line text from predetermined line arrays (no auto-wrap). */
export function linesText(opts: {
  x: number;
  y: number;
  lines: string[];
  size: number;
  lineHeight: number;
  fill?: string;
  mono?: boolean;
  weight?: number | string;
  letterSpacing?: string;
  id?: string;
}): string {
  const tspans = opts.lines
    .map((line, i) => {
      const ly = opts.y + i * opts.lineHeight;
      return `<tspan x="${opts.x}" y="${ly}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  return `<text ${textAttrs({
    x: opts.x,
    y: opts.y,
    size: opts.size,
    fill: opts.fill,
    mono: opts.mono,
    weight: opts.weight,
    letterSpacing: opts.letterSpacing,
    id: opts.id,
  })}>${tspans}</text>`;
}

/**
 * Dev/test boundary check for critical text anchors.
 * Enabled when PROFILE_SVG_STRICT=1 or NODE_ENV=test.
 */
export function assertInBounds(
  label: string,
  x: number,
  maxX: number,
  minX = 0
): void {
  const strict =
    process.env.PROFILE_SVG_STRICT === "1" || process.env.NODE_ENV === "test";
  if (!strict) return;
  if (x < minX || x > maxX) {
    throw new Error(
      `[profile-svg] ${label} x=${x} outside bounds [${minX}, ${maxX}]`
    );
  }
}

export function cutPanelPath(
  x: number,
  y: number,
  w: number,
  h: number,
  cut = 12
): string {
  const x2 = x + w;
  const y2 = y + h;
  return `M${x},${y} L${x2 - cut},${y} L${x2},${y + cut} L${x2},${y2} L${x + cut},${y2} L${x},${y2 - cut} Z`;
}

/** Activity-only wrapping with hard max width / max lines. */
export function wrapActivityLine(
  text: string,
  maxChars: number,
  maxLines = 2
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }
  if (words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1] ?? "";
    lines[lines.length - 1] =
      last.length > 2 ? `${last.slice(0, last.length - 1)}…` : `${last}…`;
  }
  return lines.length ? lines : [truncate(text, maxChars)];
}
