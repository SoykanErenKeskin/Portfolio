import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  LAYOUT,
  panelPath,
  renderWrappedText,
} from "@/lib/profile/svg/flow";
import {
  formatSvgR2,
  formatSvgShortDate,
  formatSvgStatus,
  quaroxNodeSvg,
  textAttrs,
} from "@/lib/profile/svg/helpers";
import {
  ederHouseImage,
  flowLines,
  outerFrame,
  svgRoot,
  watermark,
} from "@/lib/profile/svg/layout";

export const HERO_HEIGHT = 420;

const HUD = {
  x: 436,
  y: 28,
  w: 416,
  h: 364,
  pad: 22,
} as const;

export function renderHeroCard(data: ProfileData): string {
  const { eder } = data;
  const r2 = formatSvgR2(eder.globalR2);
  const status = formatSvgStatus(eder.projectStatus);
  const updated = formatSvgShortDate(eder.latestMeaningfulUpdate);
  const contentRight = HUD.x + HUD.w - HUD.pad;
  const contentLeft = HUD.x + HUD.pad;
  const contentW = HUD.w - HUD.pad * 2;

  const desc = renderWrappedText({
    x: contentLeft,
    y: 118,
    text: "Real estate intelligence powered by machine learning and local data.",
    maxWidth: contentW + 4,
    size: TYPE.label,
    fill: COLORS.inkMuted,
    maxLines: 2,
    lineHeight: 24,
  });

  const nodeTop = desc.bottomY + 32;
  const nodeCy = nodeTop + 36;
  const metaTop = nodeCy + 60;

  // Metadata zones
  const metaLabelY = metaTop;
  const metaValueY = metaTop + 26;
  const updateLabelY = metaTop + 58;
  const updateValueY = metaTop + 82;

  const body = `
    ${flowLines(HERO_HEIGHT)}
    ${outerFrame(HERO_HEIGHT)}
    ${watermark(690, HERO_HEIGHT - 58, 110)}

    <!-- Left identity -->
    <text ${textAttrs({ x: 40, y: 48, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.18em" })}>PERSONAL SYSTEM</text>
    <text ${textAttrs({ x: 40, y: 96, size: 34, weight: 650 })}>
      <tspan x="40" y="96">SOYKAN EREN</tspan>
      <tspan x="40" y="134">KESKIN</tspan>
    </text>
    ${
      renderWrappedText({
        x: 40,
        y: 178,
        text: "Industrial Engineer building data-driven solutions",
        maxWidth: 380,
        size: TYPE.body,
        fill: COLORS.inkMuted,
        maxLines: 2,
        lineHeight: 28,
      }).svg
    }
    <line x1="40" y1="252" x2="40" y2="322" stroke="${COLORS.coral}" stroke-opacity="0.55" stroke-width="2"/>
    ${
      renderWrappedText({
        x: 56,
        y: 274,
        text: "Solving complex systems through data and design.",
        maxWidth: 360,
        size: TYPE.bodySecondary,
        weight: 560,
        maxLines: 2,
        lineHeight: 28,
      }).svg
    }

    <!-- Right Eder HUD -->
    ${panelPath(HUD.x, HUD.y, HUD.w, HUD.h, 14, {
      fill: COLORS.bgDeep,
      stroke: COLORS.coral,
      fillOpacity: 0.9,
      strokeOpacity: 0.5,
    })}

    <text ${textAttrs({ x: contentLeft, y: 54, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.14em" })}>CURRENTLY BUILDING</text>
    <circle cx="${contentRight - 4}" cy="50" r="5" fill="${COLORS.coral}" opacity="${eder.isActive ? 1 : 0.35}"/>
    <text ${textAttrs({ x: contentLeft, y: 92, size: 30, weight: 650 })}>${escapeXml(eder.projectName)}</text>
    ${desc.svg}

    <!-- Node network (between description and metadata) -->
    <line x1="${contentLeft + 40}" y1="${nodeCy + 20}" x2="${contentLeft + contentW / 2 - 20}" y2="${nodeCy - 8}" stroke="${COLORS.coral}" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="4 6"/>
    <line x1="${contentRight - 40}" y1="${nodeCy + 20}" x2="${contentLeft + contentW / 2 + 20}" y2="${nodeCy - 8}" stroke="${COLORS.coral}" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="4 6"/>
    ${quaroxNodeSvg(contentLeft + 48, nodeCy + 16, 0.75)}
    ${quaroxNodeSvg(contentRight - 48, nodeCy + 16, 0.75)}
    <circle cx="${contentLeft + contentW / 2}" cy="${nodeCy - 8}" r="26" fill="${COLORS.bg}" stroke="${COLORS.coral}" stroke-opacity="0.45" stroke-width="1.2"/>
    ${ederHouseImage(contentLeft + contentW / 2 - 26, nodeCy - 34, 52)}

    <!-- Metadata row 1: Status | R² -->
    <text ${textAttrs({ x: contentLeft, y: metaLabelY, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.12em" })}>STATUS</text>
    <text ${textAttrs({ x: contentLeft + contentW / 2 + 8, y: metaLabelY, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.1em" })}>GLOBAL MODEL R²</text>
    <text ${textAttrs({ x: contentLeft, y: metaValueY, size: TYPE.label, fill: COLORS.ink })}>${escapeXml(status)}</text>
    <text ${textAttrs({
      x: contentLeft + contentW / 2 + 8,
      y: metaValueY + (r2.available ? 4 : 0),
      size: r2.available ? 28 : TYPE.label,
      fill: r2.available ? COLORS.coral : COLORS.inkMuted,
      mono: true,
      weight: 650,
    })}>${escapeXml(r2.text)}</text>

    <!-- Metadata row 2: Last update -->
    <text ${textAttrs({ x: contentLeft, y: updateLabelY, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.1em" })}>LAST MEANINGFUL UPDATE</text>
    <text ${textAttrs({ x: contentLeft, y: updateValueY, size: TYPE.label, fill: COLORS.inkMuted, mono: true })}>${escapeXml(updated)}</text>
  `;

  void LAYOUT;

  return svgRoot({
    height: HERO_HEIGHT,
    title: "Soykan Eren Keskin — profile and current Eder project",
    desc: "Identity card for Soykan Eren Keskin with a compact Eder live system panel showing status, latest meaningful update, and global model R-squared.",
    body,
  });
}
