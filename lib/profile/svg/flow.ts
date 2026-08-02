import { COLORS, FONT_MONO, FONT_SANS } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import { cutPanelPath, textAttrs } from "@/lib/profile/svg/helpers";

/** Approximate average glyph width relative to font-size for wrapping.
 * Slightly conservative so SVG text does not visually overflow estimated boxes. */
export function approxCharWidth(fontSize: number, mono = false): number {
  return fontSize * (mono ? 0.62 : 0.58);
}

export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  mono = false,
  maxLines = 3
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const cw = approxCharWidth(fontSize, mono);
  const maxChars = Math.max(6, Math.floor(maxWidth / cw));
  const lines: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current) {
      lines.push(current);
      current = "";
    }
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    // Current line is full — commit it and start a new one with this word
    pushCurrent();

    if (lines.length >= maxLines) {
      // Last line is full but words remain — ellipsize last line
      const last = lines[lines.length - 1]!;
      const room = Math.max(1, maxChars - 1);
      const clipped =
        last.length > room ? last.slice(0, room) : last.slice(0, Math.max(1, last.length - 1));
      lines[lines.length - 1] = `${clipped}…`;
      return lines;
    }

    if (word.length > maxChars) {
      // Hard-break oversized token
      let rest = word;
      while (rest.length > maxChars && lines.length < maxLines) {
        lines.push(rest.slice(0, maxChars - 1) + "…");
        rest = rest.slice(maxChars - 1);
      }
      current = lines.length < maxLines ? rest : "";
      if (lines.length >= maxLines) {
        return lines.slice(0, maxLines);
      }
    } else {
      current = word;
    }
  }

  pushCurrent();

  if (lines.length > maxLines) {
    const clipped = lines.slice(0, maxLines);
    const last = clipped[maxLines - 1]!;
    clipped[maxLines - 1] =
      last.length > 2 ? `${last.slice(0, last.length - 1)}…` : `${last}…`;
    return clipped;
  }

  return lines;
}

export type TextBlockOpts = {
  x: number;
  y: number;
  text: string;
  maxWidth: number;
  size: number;
  fill?: string;
  mono?: boolean;
  weight?: number | string;
  lineHeight?: number;
  maxLines?: number;
  letterSpacing?: string;
  anchor?: "start" | "middle" | "end";
};

/** Renders wrapped text; returns SVG markup + bottom Y after last baseline. */
export function renderWrappedText(opts: TextBlockOpts): {
  svg: string;
  bottomY: number;
  lines: string[];
} {
  const lineHeight = opts.lineHeight ?? opts.size * 1.3;
  const lines = wrapText(
    opts.text,
    opts.maxWidth,
    opts.size,
    opts.mono,
    opts.maxLines ?? 3
  );
  const tspans = lines
    .map((line, i) => {
      const ly = opts.y + i * lineHeight;
      return `<tspan x="${opts.x}" y="${ly}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  const svg = `<text ${textAttrs({
    x: opts.x,
    y: opts.y,
    size: opts.size,
    fill: opts.fill,
    mono: opts.mono,
    weight: opts.weight,
    letterSpacing: opts.letterSpacing,
    anchor: opts.anchor,
  })}>${tspans}</text>`;
  const bottomY =
    lines.length === 0 ? opts.y : opts.y + (lines.length - 1) * lineHeight;
  return { svg, bottomY, lines };
}

export function panelPath(
  x: number,
  y: number,
  w: number,
  h: number,
  cut = 12,
  opts?: {
    fill?: string;
    stroke?: string;
    fillOpacity?: number;
    strokeOpacity?: number;
  }
): string {
  const d = cutPanelPath(x, y, w, h, cut);
  return `<path d="${d}" fill="${opts?.fill ?? COLORS.bgDeep}" fill-opacity="${opts?.fillOpacity ?? 0.78}" stroke="${opts?.stroke ?? COLORS.border}" stroke-opacity="${opts?.strokeOpacity ?? 1}" stroke-width="1.15"/>`;
}

export function tagRow(opts: {
  x: number;
  y: number;
  labels: string[];
  maxWidth: number;
  gap?: number;
  padX?: number;
  height?: number;
  fontSize?: number;
}): { svg: string; bottomY: number } {
  const gap = opts.gap ?? 10;
  const padX = opts.padX ?? 10;
  const h = opts.height ?? 30;
  const fontSize = opts.fontSize ?? 18;
  let x = opts.x;
  const parts: string[] = [];

  for (const label of opts.labels) {
    const cw = approxCharWidth(fontSize, true);
    const needed = Math.ceil(label.length * cw) + padX * 2;
    const remaining = opts.maxWidth - (x - opts.x);
    if (remaining < 70) break;
    const w = Math.min(remaining, needed);
    const maxLabelChars = Math.max(3, Math.floor((w - padX * 2) / cw));
    const display =
      label.length > maxLabelChars
        ? `${label.slice(0, maxLabelChars - 1)}…`
        : label;
    parts.push(`
      <rect x="${x}" y="${opts.y}" width="${w}" height="${h}" fill="none" stroke="${COLORS.border}" stroke-width="1"/>
      <text ${textAttrs({
        x: x + padX,
        y: opts.y + h * 0.68,
        size: fontSize,
        fill: COLORS.inkMuted,
        mono: true,
        letterSpacing: "0.05em",
      })}>${escapeXml(display)}</text>
    `);
    x += w + gap;
  }

  return { svg: parts.join(""), bottomY: opts.y + h };
}

export function ctaRow(opts: {
  xRight: number;
  y: number;
  label: string;
}): string {
  return `<text ${textAttrs({
    x: opts.xRight,
    y: opts.y,
    size: 18,
    fill: COLORS.inkFaint,
    mono: true,
    letterSpacing: "0.08em",
    anchor: "end",
  })}>${escapeXml(opts.label)}</text>`;
}

export const LAYOUT = {
  outerPad: 28,
  panelPad: 20,
  rowGap: 16,
  sectionGap: 24,
  ctaZone: 36,
  metaZone: 72,
  minCardH: 120,
  safeBottom: 36,
} as const;

export function fontFamily(mono?: boolean): string {
  return mono ? FONT_MONO : FONT_SANS;
}
