import { readFileSync } from "node:fs";
import path from "node:path";
import { COLORS, FONT_MONO, FONT_SANS } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";

const brandCache = new Map<string, string>();

export function brandDataUri(filename: string): string {
  const cached = brandCache.get(filename);
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "public", "brand", filename);
  const buf = readFileSync(filePath);
  const uri = `data:image/png;base64,${buf.toString("base64")}`;
  brandCache.set(filename, uri);
  return uri;
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

/** @deprecated prefer formatSvgShortDate for SVG cards */
export function formatSvgInstant(iso: string | null | undefined): string {
  return formatSvgShortDate(iso);
}

export function formatSvgStatus(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Unavailable";
  const s = raw.trim().toLowerCase();
  if (s === "published") return "Published";
  if (s.includes("active")) return "Active development";
  if (s.includes("develop")) return "Active development";
  if (s === "unavailable" || s === "unknown") return "Unavailable";
  // Title-case short tokens; avoid dumping awkward internals
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
}): string {
  const font = opts.mono ? FONT_MONO : FONT_SANS;
  return [
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

/** Native Quarox-inspired cloud node (no external asset). */
export function quaroxNodeSvg(cx: number, cy: number, scale = 1): string {
  const s = scale;
  return `
    <g transform="translate(${cx},${cy}) scale(${s})" fill="${COLORS.coral}">
      <ellipse cx="0" cy="-10" rx="14" ry="9" />
      <ellipse cx="-12" cy="8" rx="10" ry="7" />
      <ellipse cx="12" cy="8" rx="10" ry="7" />
      <line x1="0" y1="-8" x2="-10" y2="6" stroke="${COLORS.bg}" stroke-width="2.2" />
      <line x1="0" y1="-8" x2="10" y2="6" stroke="${COLORS.bg}" stroke-width="2.2" />
      <circle cx="0" cy="-8" r="2.2" fill="${COLORS.bg}" />
    </g>`;
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
