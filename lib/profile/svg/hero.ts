import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  formatSvgInstant,
  formatSvgR2,
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

export const HERO_HEIGHT = 368;

export function renderHeroCard(data: ProfileData): string {
  const { identity, eder } = data;
  const r2 = formatSvgR2(eder.globalR2);
  const status = eder.projectStatus?.trim() || "—";
  const updated = formatSvgInstant(eder.latestMeaningfulUpdate);

  const body = `
    ${flowLines(HERO_HEIGHT)}
    ${outerFrame(HERO_HEIGHT)}
    ${watermark(690, 312, 140)}

    <!-- Left identity -->
    <text ${textAttrs({ x: 44, y: 52, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.18em" })}>PERSONAL SYSTEM</text>
    <text ${textAttrs({ x: 44, y: 100, size: 34, weight: 650 })}>
      <tspan x="44" dy="0">SOYKAN EREN</tspan>
      <tspan x="44" dy="38">KESKIN</tspan>
    </text>
    <text ${textAttrs({ x: 44, y: 186, size: TYPE.body, fill: COLORS.inkMuted })}>
      <tspan x="44" dy="0">Industrial Engineer building</tspan>
      <tspan x="44" dy="26">data-driven solutions</tspan>
    </text>
    <line x1="44" y1="230" x2="44" y2="290" stroke="${COLORS.coral}" stroke-opacity="0.55" stroke-width="2"/>
    <text ${textAttrs({ x: 58, y: 252, size: TYPE.bodySecondary, weight: 560 })}>
      <tspan x="58" dy="0">Solving complex systems</tspan>
      <tspan x="58" dy="26">through data and design.</tspan>
    </text>

    <!-- Right Eder HUD -->
    <path d="M450,32 L824,32 L848,56 L848,328 L474,328 L450,304 Z" fill="${COLORS.bgDeep}" fill-opacity="0.88" stroke="${COLORS.coral}" stroke-opacity="0.45" stroke-width="1.2"/>

    <text ${textAttrs({ x: 472, y: 60, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.14em" })}>CURRENTLY BUILDING</text>
    <circle cx="820" cy="54" r="5" fill="${COLORS.coral}" opacity="${eder.isActive ? 1 : 0.35}"/>
    <text ${textAttrs({ x: 472, y: 96, size: 30, weight: 650 })}>${escapeXml(eder.projectName)}</text>
    <text ${textAttrs({ x: 472, y: 126, size: TYPE.label, fill: COLORS.inkMuted })}>
      <tspan x="472" dy="0">Real estate intelligence powered by</tspan>
      <tspan x="472" dy="22">machine learning and local market data.</tspan>
    </text>

    <line x1="540" y1="210" x2="620" y2="178" stroke="${COLORS.coral}" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="4 6"/>
    <line x1="740" y1="210" x2="660" y2="178" stroke="${COLORS.coral}" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="4 6"/>
    ${quaroxNodeSvg(528, 218, 0.8)}
    ${quaroxNodeSvg(752, 218, 0.8)}
    <circle cx="640" cy="172" r="28" fill="${COLORS.bg}" stroke="${COLORS.coral}" stroke-opacity="0.45" stroke-width="1.2"/>
    ${ederHouseImage(612, 144, 56)}

    <text ${textAttrs({ x: 472, y: 258, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.12em" })}>STATUS</text>
    <text ${textAttrs({ x: 472, y: 280, size: TYPE.label, fill: COLORS.ink })}>${escapeXml(status)}</text>

    <text ${textAttrs({ x: 640, y: 258, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.1em" })}>GLOBAL MODEL R²</text>
    <text ${textAttrs({
      x: 640,
      y: 292,
      size: r2.available ? TYPE.metric : TYPE.label,
      fill: r2.available ? COLORS.coral : COLORS.inkMuted,
      mono: true,
      weight: 650,
    })}>${escapeXml(r2.text)}</text>

    <text ${textAttrs({ x: 472, y: 312, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.1em" })}>LAST MEANINGFUL UPDATE · ${escapeXml(updated)}</text>
  `;

  return svgRoot({
    height: HERO_HEIGHT,
    title: "Soykan Eren Keskin — profile and current Eder project",
    desc: "Identity card for Soykan Eren Keskin with a compact Eder live system panel showing status, latest meaningful update, and global model R-squared.",
    body,
  });
}
