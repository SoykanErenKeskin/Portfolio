import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  assertInBounds,
  formatSvgR2,
  formatSvgShortDate,
  formatSvgStatus,
  linesText,
  textAttrs,
} from "@/lib/profile/svg/helpers";
import {
  clipRect,
  ederHouseImage,
  flowLines,
  outerFrame,
  panelPath,
  quaroxNodesImage,
  svgRoot,
  watermark,
} from "@/lib/profile/svg/layout";

export const HERO_HEIGHT = 400;

const LEFT = { x: 40, w: 380 } as const;
const HUD = { x: 450, y: 32, w: 390, h: 336 } as const; // bottom pad = 400-32-336 = 32

export function renderHeroCard(data: ProfileData): string {
  const { eder } = data;
  const r2 = formatSvgR2(eder.globalR2);
  const status = formatSvgStatus(eder.projectStatus);
  const updated = formatSvgShortDate(eder.latestMeaningfulUpdate);

  const contentLeft = HUD.x + 22;
  const contentRight = HUD.x + HUD.w - 22;
  const contentW = contentRight - contentLeft;

  assertInBounds("hero-hud-left", contentLeft, 880, HUD.x);
  assertInBounds("hero-hud-right", contentRight, HUD.x + HUD.w, HUD.x);
  assertInBounds("hero-left-col", LEFT.x + LEFT.w, 450, LEFT.x);

  // Fixed graphic zone (between description and metadata)
  const graphicCy = 210;
  const metaTop = 268;

  const defs = `
    ${clipRect("clip-hero-hud", HUD.x, HUD.y, HUD.w, HUD.h)}
  `;

  const body = `
    ${flowLines(HERO_HEIGHT)}
    ${outerFrame(HERO_HEIGHT)}

    <!-- Left identity (explicit lines, no auto-wrap) -->
    <text ${textAttrs({
      x: LEFT.x,
      y: 48,
      size: TYPE.label,
      fill: COLORS.inkFaint,
      mono: true,
      letterSpacing: "0.18em",
      id: "hero-personal-label",
    })}>PERSONAL SYSTEM</text>
    ${linesText({
      x: LEFT.x,
      y: 96,
      lines: ["SOYKAN EREN", "KESKIN"],
      size: 34,
      lineHeight: 40,
      weight: 650,
      id: "hero-name",
    })}
    ${linesText({
      x: LEFT.x,
      y: 192,
      lines: ["Industrial Engineer building", "data-driven solutions"],
      size: TYPE.body,
      lineHeight: 28,
      fill: COLORS.inkMuted,
      id: "hero-role",
    })}
    <line x1="${LEFT.x}" y1="264" x2="${LEFT.x}" y2="336" stroke="${COLORS.coral}" stroke-opacity="0.55" stroke-width="2"/>
    ${linesText({
      x: LEFT.x + 16,
      y: 286,
      lines: ["Solving complex systems", "through data and design."],
      size: TYPE.bodySecondary,
      lineHeight: 28,
      weight: 560,
      id: "hero-statement",
    })}

    <!-- Right Eder HUD -->
    <g clip-path="url(#clip-hero-hud)">
      ${panelPath(HUD.x, HUD.y, HUD.w, HUD.h, 14, {
        stroke: COLORS.coral,
        fillOpacity: 0.9,
        strokeOpacity: 0.5,
      })}

      <text ${textAttrs({
        x: contentLeft,
        y: HUD.y + 28,
        size: TYPE.label,
        fill: COLORS.coral,
        mono: true,
        letterSpacing: "0.14em",
        id: "hero-building-label",
      })}>CURRENTLY BUILDING</text>
      <circle cx="${contentRight - 6}" cy="${HUD.y + 24}" r="5" fill="${COLORS.coral}" opacity="${eder.isActive ? 1 : 0.35}"/>

      <text ${textAttrs({
        x: contentLeft,
        y: HUD.y + 64,
        size: 30,
        weight: 650,
        id: "hero-eder-title",
      })}>${escapeXml(eder.projectName)}</text>

      ${linesText({
        x: contentLeft,
        y: HUD.y + 96,
        lines: [
          "Real estate intelligence powered by",
          "machine learning and local market data.",
        ],
        size: TYPE.label,
        lineHeight: 22,
        fill: COLORS.inkMuted,
        id: "hero-eder-description",
      })}

      <!-- Brand PNGs only — side by side, aspect preserved -->
      ${quaroxNodesImage(contentLeft + contentW / 2 - 90, graphicCy - 30, 64, "hero-quarox-node")}
      ${ederHouseImage(contentLeft + contentW / 2 + 10, graphicCy - 28, 56, "hero-eder-house")}

      <!-- Metadata zone (fixed) -->
      <text ${textAttrs({
        x: contentLeft,
        y: metaTop,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.12em",
        id: "hero-status-label",
      })}>STATUS</text>
      <text ${textAttrs({
        x: contentLeft + contentW / 2 + 8,
        y: metaTop,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.1em",
        id: "hero-r2-label",
      })}>GLOBAL MODEL R²</text>

      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 26,
        size: TYPE.label,
        fill: COLORS.ink,
        id: "hero-status-value",
      })}>${escapeXml(status)}</text>
      <text ${textAttrs({
        x: contentLeft + contentW / 2 + 8,
        y: metaTop + (r2.available ? 30 : 26),
        size: r2.available ? 28 : TYPE.label,
        fill: r2.available ? COLORS.coral : COLORS.inkMuted,
        mono: true,
        weight: 650,
        id: "hero-r2-value",
      })}>${escapeXml(r2.text)}</text>

      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 58,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.1em",
        id: "hero-last-update-label",
      })}>LAST MEANINGFUL UPDATE</text>
      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 82,
        size: TYPE.label,
        fill: COLORS.inkMuted,
        mono: true,
        id: "hero-last-update-value",
      })}>${escapeXml(updated)}</text>
    </g>

    <!-- Watermark outside HUD; bottom-left so cut-corner never clips it -->
    ${watermark({
      canvasW: 880,
      canvasH: HERO_HEIGHT,
      width: 88,
      margin: 52,
      opacity: 0.04,
      align: "start",
    })}
  `;

  return svgRoot({
    height: HERO_HEIGHT,
    title: "Soykan Eren Keskin — profile and current Eder project",
    desc: "Identity card for Soykan Eren Keskin with a compact Eder live system panel showing status, latest meaningful update, and global model R-squared.",
    defs,
    body,
  });
}
