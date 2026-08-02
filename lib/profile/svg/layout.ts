import { COLORS, SVG_WIDTH } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  brandDataUri,
  cutPanelPath,
} from "@/lib/profile/svg/helpers";

export function svgRoot(opts: {
  height: number;
  title: string;
  desc: string;
  body: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${opts.height}" viewBox="0 0 ${SVG_WIDTH} ${opts.height}" role="img">
  <title>${escapeXml(opts.title)}</title>
  <desc>${escapeXml(opts.desc)}</desc>
  <defs>
    <linearGradient id="gpBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${COLORS.bgDeep}"/>
      <stop offset="55%" stop-color="${COLORS.bg}"/>
      <stop offset="100%" stop-color="#0e1018"/>
    </linearGradient>
    <radialGradient id="gpGlow" cx="75%" cy="30%" r="45%">
      <stop offset="0%" stop-color="${COLORS.coral}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${COLORS.coral}" stop-opacity="0"/>
    </radialGradient>
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

export function watermark(x: number, y: number, width = 160): string {
  try {
    const href = brandDataUri("thequarox-logo.png");
    return `<image href="${href}" x="${x}" y="${y}" width="${width}" height="${Math.round(width * 0.22)}" opacity="0.06" preserveAspectRatio="xMidYMid meet"/>`;
  } catch {
    return "";
  }
}

export function ederHouseImage(
  x: number,
  y: number,
  size = 56
): string {
  try {
    const href = brandDataUri("eder-house.png");
    return `<image href="${href}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`;
  } catch {
    return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 3}" fill="none" stroke="${COLORS.coral}" stroke-width="2"/>`;
  }
}

export function flowLines(height: number): string {
  const lines: string[] = [];
  for (let i = 0; i < 14; i++) {
    const x = 40 + i * 58;
    const opacity = 0.08 + (i / 14) * 0.22;
    lines.push(
      `<line x1="${x}" y1="24" x2="${x + 36 + i * 2}" y2="${height - 24}" stroke="${COLORS.coral}" stroke-opacity="${opacity.toFixed(3)}" stroke-width="${(0.7 + i * 0.05).toFixed(2)}"/>`
    );
  }
  return `<g aria-hidden="true">${lines.join("")}</g>`;
}
