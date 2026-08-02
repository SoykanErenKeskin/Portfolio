import type { FeaturedProject, ProfileData } from "@/lib/profile/types";
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
  textAttrs,
  truncate,
  wrapActivityLine,
} from "@/lib/profile/svg/helpers";
import {
  clipRect,
  ederHouseImage,
  outerShell,
  panelPath,
  quaroxNodesImage,
  svgRoot,
  watermark,
} from "@/lib/profile/svg/layout";

export const WORK_HEIGHT = SVG_CANVAS.workMinHeight;

const PAD = 28;
const CARD_X = 28;
const CARD_W = 824;

function practiceCard(
  card: ProfileData["whatIBuild"][number],
  y: number,
  index: number
): { svg: string; defs: string; h: number } {
  const clipId = `clip-practice-${index}`;
  const descLines = wrapActivityLine(card.description, 70, 2);
  const modules = card.modules.slice(0, 3);
  const descBottom = y + 64 + (descLines.length - 1) * 18;
  let moduleY = descBottom + 16;
  const h = moduleY - y + modules.length * 26 + 16;
  const moduleRows = modules
    .map((mod, mi) => {
      const row = `
        <rect x="${CARD_X + 20}" y="${moduleY}" width="${CARD_W - 40}" height="22" fill="none" stroke="${COLORS.border}" stroke-opacity="0.9" stroke-width="1"/>
        <text ${textAttrs({
          x: CARD_X + 30,
          y: moduleY + 15,
          size: GP_TYPE.eyebrow,
          fill: COLORS.inkMuted,
          mono: true,
          letterSpacing: "0.12em",
          id: mi === 0 ? `work-practice-modules-${index}` : undefined,
        })}>${escapeXml(mod)}</text>
      `;
      moduleY += 26;
      return row;
    })
    .join("");

  return {
    h,
    defs: clipRect(clipId, CARD_X, y, CARD_W, h),
    svg: `
    <g clip-path="url(#${clipId})">
      ${panelPath(CARD_X, y, CARD_W, h, GP_CUT.sm)}
      ${quaroxNodesImage(CARD_X + 20, y + 18, 40, `work-practice-icon-${index}`)}
      <text ${textAttrs({
        x: CARD_X + CARD_W - 28,
        y: y + 34,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        anchor: "end",
      })}>0${index + 1}</text>
      <text ${textAttrs({
        x: CARD_X + 76,
        y: y + 40,
        size: GP_TYPE.title,
        weight: 650,
        id: `work-practice-title-${index}`,
      })}>${escapeXml(card.title)}</text>
      <text ${textAttrs({
        x: CARD_X + 76,
        y: y + 64,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        id: `work-practice-desc-${index}`,
      })}>${escapeXml(descLines[0] ?? "")}</text>
      ${
        descLines[1]
          ? `<text ${textAttrs({
              x: CARD_X + 76,
              y: y + 82,
              size: GP_TYPE.bodySm,
              fill: COLORS.inkMuted,
            })}>${escapeXml(descLines[1])}</text>`
          : ""
      }
      ${moduleRows}
    </g>
  `,
  };
}

function projectCard(opts: {
  project: FeaturedProject;
  y: number;
  globalR2: number | null;
  latestUpdate: string | null;
}): { svg: string; defs: string; h: number } {
  const emphasized = Boolean(opts.project.emphasized);
  const h = emphasized ? 200 : 156;
  const clipId = `clip-project-${opts.project.id}`;
  const pad = 22;
  const leftX = CARD_X + pad;
  const arch = opts.project.architecture.slice(0, 4);
  const desc = truncate(
    opts.project.solution || opts.project.problem,
    emphasized ? 72 : 68
  );

  let tagsX = leftX;
  const tags = arch
    .map((item, i) => {
      const label = item.toUpperCase().slice(0, 18);
      const w = Math.min(160, 18 + label.length * 8);
      const el = `
        <rect x="${tagsX}" y="${opts.y + (emphasized ? 118 : 92)}" width="${w}" height="24" fill="none" stroke="${COLORS.border}" stroke-width="1"/>
        <text ${textAttrs({
          x: tagsX + 8,
          y: opts.y + (emphasized ? 134 : 108),
          size: GP_TYPE.eyebrow,
          fill: COLORS.inkMuted,
          mono: true,
          letterSpacing: "0.1em",
          id: i === 0 ? `work-${opts.project.id}-modules` : undefined,
        })}>${escapeXml(label)}</text>
      `;
      tagsX += w + 10;
      return el;
    })
    .join("");

  let metrics = "";
  if (emphasized) {
    const r2 = formatSvgR2(opts.globalR2);
    const updated = formatSvgShortDate(opts.latestUpdate);
    metrics = `
      <line x1="${leftX}" y1="${opts.y + 152}" x2="${CARD_X + CARD_W - pad}" y2="${opts.y + 152}" stroke="${COLORS.borderSubtle}" stroke-width="1"/>
      <text ${textAttrs({
        x: leftX,
        y: opts.y + 172,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
      })}>LAST MEANINGFUL UPDATE</text>
      <text ${textAttrs({
        x: leftX,
        y: opts.y + 190,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        mono: true,
      })}>${escapeXml(updated)}</text>
      <text ${textAttrs({
        x: CARD_X + CARD_W - pad,
        y: opts.y + 172,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        anchor: "end",
        id: "work-eder-r2-label",
      })}>${escapeXml(
        (opts.project.metricLabel || "GLOBAL MODEL R²").toUpperCase()
      )}</text>
      <text ${textAttrs({
        x: CARD_X + CARD_W - pad,
        y: opts.y + 196,
        size: r2.available ? 26 : GP_TYPE.bodySm,
        fill: r2.available ? COLORS.coral : COLORS.inkMuted,
        mono: true,
        weight: 650,
        anchor: "end",
        id: "work-eder-r2-value",
      })}>${escapeXml(
        opts.project.metricValue ?? r2.text
      )}</text>
    `;
  }

  const status = opts.project.status
    ? `<text ${textAttrs({
        x: CARD_X + CARD_W - pad,
        y: opts.y + 36,
        size: GP_TYPE.eyebrow,
        fill: COLORS.coral,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        anchor: "end",
        id: emphasized ? "work-eder-status-value" : undefined,
      })}>${escapeXml(opts.project.status.toUpperCase())}</text>`
    : "";

  return {
    h,
    defs: clipRect(clipId, CARD_X, opts.y, CARD_W, h),
    svg: `
    <g clip-path="url(#${clipId})">
      ${panelPath(CARD_X, opts.y, CARD_W, h, GP_CUT.lg, {
        stroke: emphasized ? COLORS.coral : COLORS.border,
        active: emphasized,
      })}
      ${emphasized ? ederHouseImage(leftX, opts.y + 16, 36, "work-eder-house") : ""}
      <text ${textAttrs({
        x: emphasized ? leftX + 48 : leftX,
        y: opts.y + 40,
        size: GP_TYPE.title,
        weight: 650,
        id: `work-${opts.project.id}-title`,
      })}>${escapeXml(opts.project.title)}</text>
      ${status}
      <text ${textAttrs({
        x: leftX,
        y: opts.y + 70,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        id: `work-${opts.project.id}-description`,
      })}>${escapeXml(desc)}</text>
      <text ${textAttrs({
        x: leftX,
        y: opts.y + (emphasized ? 96 : 84),
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
      })}>ARCHITECTURE</text>
      ${tags}
      ${metrics}
    </g>
  `,
  };
}

export function renderWorkCard(data: ProfileData): string {
  let y = 72;
  const defsParts: string[] = [];
  const practiceCards = (data.whatIBuild.length
    ? data.whatIBuild
    : []
  )
    .slice(0, 3)
    .map((card, i) => {
      const block = practiceCard(card, y, i);
      defsParts.push(block.defs);
      y += block.h + 14;
      return block.svg;
    })
    .join("");

  y += 18;
  const projectsHeaderY = y;
  y += 50;

  const projectBlocks = data.projects.slice(0, 3).map((project) => {
    const block = projectCard({
      project,
      y,
      globalR2: data.eder.globalR2,
      latestUpdate:
        project.latestMeaningfulUpdate ?? data.eder.latestMeaningfulUpdate,
    });
    defsParts.push(block.defs);
    y += block.h + 14;
    return block.svg;
  }).join("");

  y += PAD;
  const height = Math.max(WORK_HEIGHT, y);

  const body = `
    ${outerShell(height)}
    ${watermark({
      canvasH: height,
      width: 120,
      x: 880 - 40 - 120,
      y: 36,
      opacity: 0.05,
    })}
    <text ${textAttrs({
      x: PAD,
      y: 36,
      size: GP_TYPE.eyebrow,
      fill: COLORS.coral,
      mono: true,
      letterSpacing: GP_TRACKING.eyebrow,
      id: "work-practice-label",
    })}>PRACTICE</text>
    <text ${textAttrs({
      x: PAD,
      y: 62,
      size: GP_TYPE.section,
      weight: 650,
      id: "work-practice-heading",
    })}>What I Build</text>
    ${practiceCards}
    <text ${textAttrs({
      x: PAD,
      y: projectsHeaderY,
      size: GP_TYPE.eyebrow,
      fill: COLORS.coral,
      mono: true,
      letterSpacing: GP_TRACKING.eyebrow,
      id: "work-selected-label",
    })}>SELECTED WORK</text>
    <text ${textAttrs({
      x: PAD,
      y: projectsHeaderY + 28,
      size: GP_TYPE.section,
      weight: 650,
      id: "work-projects-heading",
    })}>Featured Projects</text>
    ${projectBlocks}
  `;

  return svgRoot({
    height,
    title: "What I build and featured projects",
    desc: "Practice areas and featured projects aligned with the admin profile preview.",
    defs: defsParts.join(""),
    body,
  });
}
