import { COLORS, SVG_WIDTH } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  brandImage,
  cutPanelPath,
} from "@/lib/profile/svg/helpers";

export function svgRoot(opts: {
  height: number;
  title: string;
  desc: string;
  defs?: string;
  body: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SVG_WIDTH}" height="${opts.height}" viewBox="0 0 ${SVG_WIDTH} ${opts.height}" role="img">
  <title>${escapeXml(opts.title)}</title>
  <desc>${escapeXml(opts.desc)}</desc>
  <defs>
    <linearGradient id="gpBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${COLORS.bgDeep}"/>
      <stop offset="55%" stop-color="${COLORS.bg}"/>
      <stop offset="100%" stop-color="#0e1018"/>
    </linearGradient>
    <radialGradient id="gpGlow" cx="72%" cy="28%" r="42%">
      <stop offset="0%" stop-color="${COLORS.coral}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${COLORS.coral}" stop-opacity="0"/>
    </radialGradient>
    ${opts.defs ?? ""}
  </defs>
  <rect width="${SVG_WIDTH}" height="${opts.height}" fill="url(#gpBg)"/>
  <rect width="${SVG_WIDTH}" height="${opts.height}" fill="url(#gpGlow)"/>
  ${opts.body}
</svg>`;
}

export function outerFrame(height: number): string {
  const d = cutPanelPath(12, 12, SVG_WIDTH - 24, height - 24, 14);
  return `<path d="${d}" fill="${COLORS.bgRaised}" fill-opacity="0.55" stroke="${COLORS.border}" stroke-width="1.25"/>`;
}

export function panelPath(
  x: number,
  y: number,
  w: number,
  h: number,
  cut = 12,
  opts?: { stroke?: string; fillOpacity?: number; strokeOpacity?: number }
): string {
  const d = cutPanelPath(x, y, w, h, cut);
  return `<path d="${d}" fill="${COLORS.bgDeep}" fill-opacity="${opts?.fillOpacity ?? 0.8}" stroke="${opts?.stroke ?? COLORS.border}" stroke-opacity="${opts?.strokeOpacity ?? 1}" stroke-width="1.15"/>`;
}

export function clipRect(id: string, x: number, y: number, w: number, h: number): string {
  return `<clipPath id="${escapeXml(id)}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;
}

/**
 * TheQuarox watermark — low opacity, aspect-preserved, inset from canvas edge.
 * Extra margin clears cut-corner frames so the mark is never clipped.
 * Returns empty string if it cannot fit with the requested margin.
 */
export function watermark(opts: {
  canvasW: number;
  canvasH: number;
  width?: number;
  margin?: number;
  opacity?: number;
  /** default end = bottom-right */
  align?: "start" | "end";
}): string {
  const margin = opts.margin ?? 48;
  const width = opts.width ?? 96;
  const height = width / (496 / 81);
  const x =
    opts.align === "start"
      ? margin
      : opts.canvasW - margin - width;
  const y = opts.canvasH - margin - height;
  if (x < 20 || y < 20) return "";
  if (x + width > opts.canvasW - 20) return "";
  if (y + height > opts.canvasH - 20) return "";
  return brandImage({
    file: "thequarox-logo.png",
    x,
    y,
    width,
    opacity: opts.opacity ?? 0.045,
    id: "watermark-thequarox",
  });
}

export function ederHouseImage(
  x: number,
  y: number,
  size = 56,
  id?: string
): string {
  return brandImage({
    file: "eder-house.png",
    x,
    y,
    width: size,
    id: id ?? "icon-eder-house",
  });
}

export function quaroxNodesImage(
  x: number,
  y: number,
  size = 72,
  id?: string
): string {
  return brandImage({
    file: "quarox-nodes.png",
    x,
    y,
    width: size,
    id: id ?? "icon-quarox-nodes",
  });
}

export function flowLines(height: number): string {
  const lines: string[] = [];
  for (let i = 0; i < 10; i++) {
    const x = 48 + i * 72;
    const opacity = 0.06 + (i / 10) * 0.14;
    lines.push(
      `<line x1="${x}" y1="28" x2="${x + 28 + i}" y2="${height - 28}" stroke="${COLORS.coral}" stroke-opacity="${opacity.toFixed(3)}" stroke-width="0.9"/>`
    );
  }
  return `<g aria-hidden="true">${lines.join("")}</g>`;
}
