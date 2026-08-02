import type { ProfileData } from "@/lib/profile/types";
import {
  GP_CUT,
  GP_SPACE,
  GP_TRACKING,
  GP_TYPE,
  SVG_CANVAS,
} from "@/lib/profile/design-tokens";
import { COLORS } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  formatSvgR2,
  formatSvgShortDate,
  linesText,
  textAttrs,
  truncate,
} from "@/lib/profile/svg/helpers";
import {
  clipRect,
  ederHouseImage,
  flowLines,
  outerShell,
  panelPath,
  quaroxNodesImage,
  svgRoot,
  watermark,
} from "@/lib/profile/svg/layout";

export const HERO_HEIGHT = SVG_CANVAS.heroHeight;

export function renderHeroCard(data: ProfileData): string {
  const { identity, eder } = data;
  const r2 = formatSvgR2(eder.globalR2);
  const status = truncate(eder.projectStatus?.trim() || "Status unavailable", 22);
  const updated = formatSvgShortDate(eder.latestMeaningfulUpdate);
  const snapshot = formatSvgShortDate(eder.snapshotUpdatedAt);
  const scope = truncate(eder.scope?.trim() || "Scope unavailable", 28);

  const shellX = GP_SPACE.outerInset;
  const shellY = GP_SPACE.outerInset;
  const shellW = 880 - shellX * 2;
  const shellH = HERO_HEIGHT - shellY * 2;

  const leftX = shellX + 28;
  const leftW = 360;
  const dividerX = 420;
  const hudX = 436;
  const hudY = shellY + 18;
  const hudW = 408;
  const hudH = shellH - 36;
  const hudPad = 22;
  const contentLeft = hudX + hudPad;
  const contentRight = hudX + hudW - hudPad;

  const nameLines =
    identity.name.length > 22
      ? ["SOYKAN EREN", "KESKIN"]
      : [identity.name];

  const defs = `
    ${clipRect("clip-hero-hud", hudX, hudY, hudW, hudH)}
  `;

  const nodeCy = hudY + 188;
  const metaTop = hudY + 250;

  const body = `
    ${flowLines(HERO_HEIGHT)}
    ${outerShell(HERO_HEIGHT)}
    ${watermark({
      canvasH: HERO_HEIGHT,
      width: 150,
      x: shellX + shellW - 170,
      y: shellY + shellH - 36,
      opacity: 0.055,
    })}

    <!-- Identity column -->
    <text ${textAttrs({
      x: leftX,
      y: shellY + 48,
      size: GP_TYPE.eyebrow,
      fill: COLORS.inkFaint,
      mono: true,
      letterSpacing: GP_TRACKING.eyebrow,
      id: "hero-personal-label",
    })}>PERSONAL SYSTEM</text>
    ${linesText({
      x: leftX,
      y: shellY + 96,
      lines: nameLines,
      size: GP_TYPE.name,
      lineHeight: 42,
      weight: 650,
      id: "hero-name",
    })}
    ${linesText({
      x: leftX,
      y: shellY + 196,
      lines: ["Industrial Engineer building", "data-driven solutions"],
      size: GP_TYPE.bodyLg,
      lineHeight: 26,
      fill: COLORS.inkMuted,
      id: "hero-role",
    })}
    <line x1="${leftX}" y1="${shellY + 268}" x2="${leftX}" y2="${shellY + 340}" stroke="${COLORS.coral}" stroke-opacity="0.5" stroke-width="1.5"/>
    ${linesText({
      x: leftX + 14,
      y: shellY + 290,
      lines: ["Solving complex systems", "through data and design."],
      size: GP_TYPE.bodyLg,
      lineHeight: 26,
      weight: 560,
      id: "hero-statement",
    })}

    <!-- Vertical divider -->
    <line x1="${dividerX}" y1="${shellY + 24}" x2="${dividerX}" y2="${shellY + shellH - 24}" stroke="${COLORS.borderSubtle}" stroke-width="1"/>

    <!-- Eder live panel (coral, layered) -->
    <g clip-path="url(#clip-hero-hud)">
      ${panelPath(hudX, hudY, hudW, hudH, GP_CUT.lg, {
        stroke: COLORS.coral,
        active: true,
      })}

      <!-- Soft coral wash -->
      <ellipse cx="${hudX + hudW * 0.25}" cy="${hudY + 60}" rx="90" ry="70" fill="${COLORS.coral}" fill-opacity="0.05"/>
      <ellipse cx="${hudX + hudW * 0.8}" cy="${hudY + hudH - 40}" rx="100" ry="60" fill="${COLORS.coral}" fill-opacity="0.04"/>

      <text ${textAttrs({
        x: contentLeft,
        y: hudY + 28,
        size: GP_TYPE.eyebrow,
        fill: COLORS.coral,
        mono: true,
        letterSpacing: GP_TRACKING.eyebrow,
        id: "hero-building-label",
      })}>LIVE SYSTEM</text>
      <text ${textAttrs({
        x: contentRight - 28,
        y: hudY + 28,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkMuted,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        anchor: "end",
        id: "hero-active-label",
      })}>${eder.isActive ? "ACTIVE" : "IDLE"}</text>
      <circle cx="${contentRight - 8}" cy="${hudY + 24}" r="5" fill="${COLORS.coral}" opacity="${eder.isActive ? 1 : 0.35}"/>

      <text ${textAttrs({
        x: contentLeft,
        y: hudY + 62,
        size: 28,
        weight: 650,
        id: "hero-eder-title",
      })}>${escapeXml(eder.projectName)}</text>

      ${linesText({
        x: contentLeft,
        y: hudY + 90,
        lines: [
          "Real estate intelligence powered by machine learning",
          "and local market data.",
        ],
        size: GP_TYPE.bodySm,
        lineHeight: 20,
        fill: COLORS.inkMuted,
        id: "hero-eder-description",
      })}

      <!-- Node network -->
      <line x1="${contentLeft + 48}" y1="${nodeCy + 28}" x2="${contentLeft + 170}" y2="${nodeCy - 8}" stroke="${COLORS.coral}" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="5 5"/>
      <line x1="${contentRight - 48}" y1="${nodeCy + 28}" x2="${contentLeft + 230}" y2="${nodeCy - 8}" stroke="${COLORS.coral}" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="5 5"/>
      <line x1="${contentLeft + 200}" y1="${nodeCy - 48}" x2="${contentLeft + 200}" y2="${nodeCy - 22}" stroke="${COLORS.coral}" stroke-opacity="0.3" stroke-width="1"/>
      ${quaroxNodesImage(contentLeft + 20, nodeCy + 4, 44, "hero-quarox-node")}
      ${quaroxNodesImage(contentRight - 64, nodeCy + 4, 44, "hero-quarox-node-b")}
      ${ederHouseImage(contentLeft + 168, nodeCy - 36, 64, "hero-eder-house")}
      <text ${textAttrs({
        x: contentLeft + 200,
        y: nodeCy + 46,
        size: 10,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.16em",
        anchor: "middle",
      })}>CENTRAL NODE</text>

      <line x1="${contentLeft}" y1="${metaTop - 12}" x2="${contentRight}" y2="${metaTop - 12}" stroke="${COLORS.borderSubtle}" stroke-width="1"/>

      <!-- Metric grid -->
      <text ${textAttrs({
        x: contentLeft,
        y: metaTop,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        id: "hero-status-label",
      })}>DEVELOPMENT STATUS</text>
      <text ${textAttrs({
        x: contentLeft + 200,
        y: metaTop,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        id: "hero-last-update-label",
      })}>LAST MEANINGFUL UPDATE</text>
      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 22,
        size: GP_TYPE.bodySm,
        fill: COLORS.ink,
        id: "hero-status-value",
      })}>${escapeXml(status)}</text>
      <text ${textAttrs({
        x: contentLeft + 200,
        y: metaTop + 22,
        size: GP_TYPE.bodySm,
        fill: COLORS.ink,
        mono: true,
        id: "hero-last-update-value",
      })}>${escapeXml(updated)}</text>

      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 54,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        id: "hero-r2-label",
      })}>GLOBAL MODEL R²</text>
      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 86,
        size: r2.available ? GP_TYPE.metric : GP_TYPE.bodySm,
        fill: r2.available ? COLORS.coral : COLORS.inkMuted,
        mono: true,
        weight: 650,
        id: "hero-r2-value",
      })}>${escapeXml(r2.text)}</text>

      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 118,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
      })}>SNAPSHOT UPDATED</text>
      <text ${textAttrs({
        x: contentLeft + 200,
        y: metaTop + 118,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
      })}>SCOPE</text>
      <text ${textAttrs({
        x: contentLeft,
        y: metaTop + 140,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        mono: true,
        id: "hero-snapshot-value",
      })}>${escapeXml(snapshot)}</text>
      <text ${textAttrs({
        x: contentLeft + 200,
        y: metaTop + 140,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        id: "hero-scope-value",
      })}>${escapeXml(scope)}</text>
    </g>
  `;

  void leftW;

  return svgRoot({
    height: HERO_HEIGHT,
    title: "Soykan Eren Keskin — profile and current Eder project",
    desc: "Identity card for Soykan Eren Keskin with a live Eder system panel showing status, latest meaningful update, and global model R-squared.",
    defs,
    body,
  });
}
