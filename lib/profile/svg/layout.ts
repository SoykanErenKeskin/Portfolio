import {
  GP_CUT,
  GP_OPACITY,
  GP_COLOR,
  SVG_CANVAS,
} from "@/lib/profile/design-tokens";
import { COLORS, SVG_WIDTH } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  brandImage,
  cutPanelPath,
  type BrandFile,
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
    <linearGradient id="gpCanvas" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="${GP_COLOR.bgDeep}"/>
      <stop offset="45%" stop-color="${GP_COLOR.bg}"/>
      <stop offset="100%" stop-color="${GP_COLOR.canvasEnd}"/>
    </linearGradient>
    <radialGradient id="gpCanvasGlow" cx="70%" cy="20%" r="55%">
      <stop offset="0%" stop-color="${COLORS.coral}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${COLORS.coral}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gpPanelFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${COLORS.bgRaised}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${COLORS.bgDeep}" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="gpActiveGlow" cx="50%" cy="80%" r="60%">
      <stop offset="0%" stop-color="${COLORS.coral}" stop-opacity="${GP_OPACITY.panelActiveGlow}"/>
      <stop offset="100%" stop-color="${COLORS.coral}" stop-opacity="0"/>
    </radialGradient>
    ${opts.defs ?? ""}
  </defs>
  <rect width="${SVG_WIDTH}" height="${opts.height}" fill="url(#gpCanvas)"/>
  <rect width="${SVG_WIDTH}" height="${opts.height}" fill="url(#gpCanvasGlow)"/>
  ${opts.body}
</svg>`;
}

/** Subtle outer shell — not a heavy technical frame. */
export function outerShell(height: number): string {
  const inset = 10;
  const d = cutPanelPath(
    inset,
    inset,
    SVG_WIDTH - inset * 2,
    height - inset * 2,
    GP_CUT.lg
  );
  return `<path d="${d}" fill="url(#gpPanelFill)" stroke="${COLORS.border}" stroke-opacity="${GP_OPACITY.panelBorder}" stroke-width="1"/>`;
}

export function panelPath(
  x: number,
  y: number,
  w: number,
  h: number,
  cut: number = GP_CUT.lg,
  opts?: {
    stroke?: string;
    strokeOpacity?: number;
    fill?: string;
    active?: boolean;
  }
): string {
  const d = cutPanelPath(x, y, w, h, cut);
  const stroke = opts?.stroke ?? COLORS.border;
  const strokeOpacity =
    opts?.strokeOpacity ??
    (opts?.active ? GP_OPACITY.panelActiveBorder : GP_OPACITY.panelBorder);
  const fill = opts?.fill ?? "url(#gpPanelFill)";
  const glow = opts?.active
    ? `<ellipse cx="${x + w / 2}" cy="${y + h - 8}" rx="${w * 0.42}" ry="28" fill="url(#gpActiveGlow)"/>`
    : "";
  return `${glow}<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="1.1"/>`;
}

export function clipRect(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number
): string {
  return `<clipPath id="${escapeXml(id)}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;
}

/** Rounded plate + brand PNG — mirrors React QuaroxCloudIcon / EderHouseIcon. */
export function iconPlate(opts: {
  x: number;
  y: number;
  size: number;
  file: BrandFile;
  id?: string;
  radius?: number;
}): string {
  const r = opts.radius ?? Math.round(opts.size * 0.28);
  const pad = opts.size * 0.18;
  const imgSize = opts.size - pad * 2;
  return `
    <rect x="${opts.x}" y="${opts.y}" width="${opts.size}" height="${opts.size}" rx="${r}" ry="${r}" fill="${COLORS.bgDeep}" fill-opacity="0.92" stroke="${COLORS.coral}" stroke-opacity="${GP_OPACITY.iconPlateBorder}" stroke-width="1"/>
    ${brandImage({
      file: opts.file,
      x: opts.x + pad,
      y: opts.y + pad,
      width: imgSize,
      id: opts.id,
    })}
  `;
}

export function watermark(opts: {
  canvasW?: number;
  canvasH: number;
  width?: number;
  x?: number;
  y?: number;
  opacity?: number;
}): string {
  const canvasW = opts.canvasW ?? SVG_CANVAS.width;
  const width = opts.width ?? 140;
  const height = width / (496 / 81);
  const x = opts.x ?? canvasW - 24 - width;
  const y = opts.y ?? opts.canvasH - 22 - height;
  return brandImage({
    file: "thequarox-logo.png",
    x,
    y,
    width,
    opacity: opts.opacity ?? GP_OPACITY.watermark,
    id: "watermark-thequarox",
  });
}

export function ederHouseImage(
  x: number,
  y: number,
  size = 56,
  id?: string
): string {
  return iconPlate({
    x,
    y,
    size,
    file: "eder-house.png",
    id: id ?? "icon-eder-house",
    radius: size > 60 ? 18 : 14,
  });
}

export function quaroxNodesImage(
  x: number,
  y: number,
  size = 44,
  id?: string
): string {
  return iconPlate({
    x,
    y,
    size,
    file: "quarox-nodes.png",
    id: id ?? "icon-quarox-nodes",
  });
}

/** Background data marks matching ProfileHero. */
export function flowLines(height: number): string {
  const lines: string[] = [];
  for (let i = 0; i < 16; i++) {
    const x = 36 + i * 52;
    const density = i / 15;
    const opacity = (
      GP_OPACITY.flowLineMin +
      density * (GP_OPACITY.flowLineMax - GP_OPACITY.flowLineMin)
    ).toFixed(3);
    const sw = (0.55 + density * 0.7).toFixed(2);
    lines.push(
      `<line x1="${x}" y1="18" x2="${x + 28 + density * 36}" y2="${height - 18}" stroke="${COLORS.coral}" stroke-opacity="${opacity}" stroke-width="${sw}"/>`
    );
  }
  return `<g aria-hidden="true" opacity="0.4">${lines.join("")}</g>`;
}
