import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  assertInBounds,
  formatSvgR2,
  formatSvgStatus,
  textAttrs,
} from "@/lib/profile/svg/helpers";
import {
  clipRect,
  ederHouseImage,
  outerFrame,
  panelPath,
  quaroxNodesImage,
  svgRoot,
  watermark,
} from "@/lib/profile/svg/layout";

/** Fixed README work card height (taller than early 900 target for padding). */
export const WORK_HEIGHT = 1014;

const PAD = 32;
const CARD_X = 32;
const CARD_W = 816;

const WHAT_I_BUILD = [
  {
    title: "Engineering Systems",
    description: "Structured systems for complex workflows.",
    modules: "PROCESS DESIGN · SYSTEM ARCHITECTURE · OPTIMIZATION",
  },
  {
    title: "Data & Intelligence",
    description: "Models and pipelines for useful decisions.",
    modules: "MACHINE LEARNING · FEATURE ENGINEERING · DECISION SUPPORT",
  },
  {
    title: "Digital Products",
    description: "Technical solutions shaped into usable products.",
    modules: "PRODUCT DESIGN · FRONTEND · DATA VISUALIZATION",
  },
] as const;

function practiceCard(
  card: (typeof WHAT_I_BUILD)[number],
  y: number,
  index: number
): { svg: string; defs: string } {
  const h = 96;
  const clipId = `clip-practice-${index}`;
  assertInBounds(`practice-${index}`, CARD_X + CARD_W, 880, CARD_X);
  return {
    defs: clipRect(clipId, CARD_X, y, CARD_W, h),
    svg: `
    <g clip-path="url(#${clipId})">
      ${panelPath(CARD_X, y, CARD_W, h, 10, { fillOpacity: 0.72 })}
      ${quaroxNodesImage(CARD_X + 18, y + 22, 40, `work-practice-icon-${index}`)}
      <text ${textAttrs({
        x: CARD_X + 72,
        y: y + 36,
        size: 22,
        weight: 650,
        id: `work-practice-title-${index}`,
      })}>${escapeXml(card.title)}</text>
      <text ${textAttrs({
        x: CARD_X + 72,
        y: y + 60,
        size: TYPE.label,
        fill: COLORS.inkMuted,
        id: `work-practice-desc-${index}`,
      })}>${escapeXml(card.description)}</text>
      <text ${textAttrs({
        x: CARD_X + 72,
        y: y + 82,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.06em",
        id: `work-practice-modules-${index}`,
      })}>${escapeXml(card.modules)}</text>
    </g>
  `,
  };
}

function moduleRow(opts: {
  x: number;
  y: number;
  labels: string[];
  id: string;
}): string {
  return opts.labels
    .map((label, i) => {
      const lx = opts.x + i * 196;
      return `
        <rect x="${lx}" y="${opts.y}" width="180" height="28" fill="none" stroke="${COLORS.border}" stroke-width="1"/>
        <text ${textAttrs({
          x: lx + 10,
          y: opts.y + 19,
          size: TYPE.label,
          fill: COLORS.inkMuted,
          mono: true,
          letterSpacing: "0.05em",
          id: i === 0 ? opts.id : undefined,
        })}>${escapeXml(label)}</text>
      `;
    })
    .join("");
}

function projectCard(opts: {
  id: string;
  title: string;
  description: string;
  modules: string[];
  y: number;
  h: number;
  emphasized?: boolean;
  status?: string;
  r2Text?: string | null;
  r2Available?: boolean;
}): { svg: string; defs: string } {
  const clipId = `clip-project-${opts.id}`;
  const pad = 24;
  const leftX = CARD_X + pad;

  let rightMetrics = "";
  if (opts.emphasized) {
    const mx = CARD_X + CARD_W - pad - 150;
    rightMetrics = `
      <text ${textAttrs({
        x: mx,
        y: opts.y + 36,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.1em",
        id: "work-eder-status-label",
      })}>STATUS</text>
      <text ${textAttrs({
        x: mx,
        y: opts.y + 58,
        size: TYPE.label,
        fill: COLORS.coral,
        mono: true,
        id: "work-eder-status-value",
      })}>${escapeXml(opts.status ?? "Unavailable")}</text>
      <text ${textAttrs({
        x: mx,
        y: opts.y + 90,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.1em",
        id: "work-eder-r2-label",
      })}>GLOBAL R²</text>
      <text ${textAttrs({
        x: mx,
        y: opts.y + 120,
        size: opts.r2Available ? 28 : TYPE.label,
        fill: opts.r2Available ? COLORS.coral : COLORS.inkMuted,
        mono: true,
        weight: 650,
        id: "work-eder-r2-value",
      })}>${escapeXml(opts.r2Text ?? "—")}</text>
    `;
  }

  const titleX = opts.emphasized ? leftX + 40 : leftX;

  return {
    defs: clipRect(clipId, CARD_X, opts.y, CARD_W, opts.h),
    svg: `
    <g clip-path="url(#${clipId})">
      ${panelPath(CARD_X, opts.y, CARD_W, opts.h, 12, {
        stroke: opts.emphasized ? COLORS.coral : COLORS.border,
        fillOpacity: opts.emphasized ? 0.9 : 0.72,
        strokeOpacity: opts.emphasized ? 0.5 : 0.9,
      })}
      ${opts.emphasized ? ederHouseImage(leftX, opts.y + 20, 32, "work-eder-house") : ""}
      <text ${textAttrs({
        x: titleX,
        y: opts.y + 40,
        size: 22,
        weight: 650,
        id: `work-${opts.id}-title`,
      })}>${escapeXml(opts.title)}</text>
      <text ${textAttrs({
        x: leftX,
        y: opts.y + 70,
        size: TYPE.label,
        fill: COLORS.inkMuted,
        id: `work-${opts.id}-description`,
      })}>${escapeXml(opts.description)}</text>
      ${moduleRow({
        x: leftX,
        y: opts.y + 96,
        labels: opts.modules,
        id: `work-${opts.id}-modules`,
      })}
      ${rightMetrics}
    </g>
  `,
  };
}

export function renderWorkCard(data: ProfileData): string {
  let y = 78;
  const defsParts: string[] = [];
  const practiceBlocks = WHAT_I_BUILD.map((card, i) => {
    const block = practiceCard(card, y, i);
    defsParts.push(block.defs);
    y += 108;
    return block.svg;
  }).join("");

  y += 20;
  const projectsHeaderY = y;
  y += 48;

  const eder = data.projects.find((p) => p.id === "eder");
  const r2 = formatSvgR2(data.eder.globalR2);

  const ederH = 168;
  const otherH = 156;
  const projectSvgs: string[] = [];

  const ederCard = projectCard({
    id: "eder",
    title: "EDER",
    description:
      "Machine learning valuation and regional market intelligence.",
    modules: ["ML VALUATION", "REGIONAL INSIGHTS", "DATA PIPELINE"],
    y,
    h: ederH,
    emphasized: true,
    status: formatSvgStatus(eder?.status ?? data.eder.projectStatus),
    r2Text: r2.text,
    r2Available: r2.available,
  });
  defsParts.push(ederCard.defs);
  projectSvgs.push(ederCard.svg);
  y += ederH + 16;

  const orderCard = projectCard({
    id: "order-tracking",
    title: "ORDER TRACKING APP",
    description: "Role-based order and delivery tracking.",
    modules: ["REACT NATIVE", "POSTGRESQL", "ROLE ACCESS"],
    y,
    h: otherH,
  });
  defsParts.push(orderCard.defs);
  projectSvgs.push(orderCard.svg);
  y += otherH + 16;

  const reservoirCard = projectCard({
    id: "reservoir",
    title: "RESERVOIR FORECASTING",
    description: "Time-series forecasting for reservoir systems.",
    modules: ["PYTHON", "TIME SERIES", "MODEL EVAL"],
    y,
    h: otherH,
  });
  defsParts.push(reservoirCard.defs);
  projectSvgs.push(reservoirCard.svg);
  y += otherH + PAD;

  const height = Math.max(WORK_HEIGHT, y);

  const body = `
    ${outerFrame(height)}
    ${watermark({
      canvasW: 880,
      canvasH: height,
      width: 96,
      margin: 48,
      opacity: 0.045,
    })}
    <text ${textAttrs({
      x: PAD,
      y: 40,
      size: TYPE.label,
      fill: COLORS.coral,
      mono: true,
      letterSpacing: "0.18em",
      id: "work-practice-label",
    })}>PRACTICE</text>
    <text ${textAttrs({
      x: PAD,
      y: 68,
      size: TYPE.section,
      weight: 650,
      id: "work-practice-heading",
    })}>What I Build</text>
    ${practiceBlocks}
    <text ${textAttrs({
      x: PAD,
      y: projectsHeaderY,
      size: TYPE.label,
      fill: COLORS.coral,
      mono: true,
      letterSpacing: "0.18em",
      id: "work-selected-label",
    })}>SELECTED WORK</text>
    <text ${textAttrs({
      x: PAD,
      y: projectsHeaderY + 28,
      size: TYPE.section,
      weight: 650,
      id: "work-projects-heading",
    })}>Featured Projects</text>
    ${projectSvgs.join("")}
  `;

  return svgRoot({
    height,
    title: "What I build and featured projects",
    desc: "Practice areas and featured projects: Eder, Order Tracking App, and Reservoir Forecasting.",
    defs: defsParts.join(""),
    body,
  });
}
