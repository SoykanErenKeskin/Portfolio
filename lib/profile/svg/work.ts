import type { FeaturedProject, ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  LAYOUT,
  ctaRow,
  panelPath,
  renderWrappedText,
  tagRow,
} from "@/lib/profile/svg/flow";
import {
  formatSvgR2,
  formatSvgStatus,
  quaroxNodeSvg,
  textAttrs,
} from "@/lib/profile/svg/helpers";
import {
  ederHouseImage,
  outerFrame,
  svgRoot,
  watermark,
} from "@/lib/profile/svg/layout";

const WHAT_I_BUILD = [
  {
    title: "Engineering Systems",
    copy: "Structured systems for complex workflows.",
    modules: ["PROCESS DESIGN", "SYSTEM ARCHITECTURE", "OPTIMIZATION"],
  },
  {
    title: "Data & Intelligence",
    copy: "Models and pipelines for useful decisions.",
    modules: ["MACHINE LEARNING", "FEATURE ENGINEERING", "DECISION SUPPORT"],
  },
  {
    title: "Digital Products",
    copy: "Technical solutions as products.",
    modules: ["PRODUCT DESIGN", "FRONTEND DEVELOPMENT", "DATA VISUALIZATION"],
  },
] as const;

const PROJECT_COPY: Record<string, { line: string; labels: string[] }> = {
  eder: {
    line: "ML valuation and regional market intelligence.",
    labels: ["ML VALUATION", "REGIONAL INSIGHTS", "DATA PIPELINE"],
  },
  "order-tracking": {
    line: "Role-based order and delivery tracking.",
    labels: ["REACT NATIVE", "POSTGRESQL", "ROLE ACCESS"],
  },
  "reservoir-forecasting": {
    line: "Time-series forecasting for reservoir systems.",
    labels: ["PYTHON", "TIME SERIES", "MODEL EVAL"],
  },
};

function projectCtaLabel(project: FeaturedProject): string {
  const parts: string[] = ["VIEW PROJECT"];
  if (project.technicalOverviewHref && !project.sourceHref) {
    parts.push("TECHNICAL OVERVIEW");
  }
  if (project.sourceHref) {
    parts.push("SOURCE");
  }
  return parts.join("  ·  ");
}

function renderWhatIBuildColumn(
  card: (typeof WHAT_I_BUILD)[number],
  x: number,
  y: number,
  w: number,
  h: number
): string {
  const pad = 16;
  const title = renderWrappedText({
    x: x + pad + 40,
    y: y + 40,
    text: card.title,
    maxWidth: w - pad * 2 - 44,
    size: 20,
    weight: 650,
    maxLines: 2,
    lineHeight: 24,
  });
  const desc = renderWrappedText({
    x: x + pad,
    y: Math.max(title.bottomY + 22, y + 86),
    text: card.copy,
    maxWidth: w - pad * 2,
    size: TYPE.label,
    fill: COLORS.inkMuted,
    maxLines: 2,
    lineHeight: 22,
  });
  let moduleY = desc.bottomY + 34;
  const modules = card.modules
    .map((m) => {
      const row = `
        <rect x="${x + pad}" y="${moduleY}" width="${w - pad * 2}" height="28" fill="none" stroke="${COLORS.border}" stroke-width="1"/>
        <text ${textAttrs({
          x: x + pad + 10,
          y: moduleY + 19,
          size: TYPE.label,
          fill: COLORS.inkMuted,
          mono: true,
          letterSpacing: "0.07em",
        })}>${escapeXml(m)}</text>
      `;
      moduleY += 34;
      return row;
    })
    .join("");

  return `
    ${panelPath(x, y, w, h, 10, { fillOpacity: 0.72 })}
    ${quaroxNodeSvg(x + pad + 18, y + 36, 0.65)}
    ${title.svg}
    ${desc.svg}
    ${modules}
  `;
}

function renderProjectCard(opts: {
  project: FeaturedProject;
  x: number;
  y: number;
  w: number;
  h: number;
  globalR2: number | null;
}): string {
  const { project, x, y, w, h, globalR2 } = opts;
  const pad = 18;
  const emphasized = Boolean(project.emphasized);
  const copy = PROJECT_COPY[project.id] ?? {
    line: project.solution,
    labels: project.architecture.slice(0, 3).map((a) => a.toUpperCase()),
  };
  const leftW = emphasized ? w - pad * 2 - 160 : w - pad * 2;
  const titleX = emphasized ? x + pad + 42 : x + pad;

  const title = renderWrappedText({
    x: titleX,
    y: y + 34,
    text: project.title,
    maxWidth: leftW - (emphasized ? 0 : 0),
    size: 22,
    weight: 650,
    maxLines: 1,
  });

  const desc = renderWrappedText({
    x: x + pad,
    y: title.bottomY + 20,
    text: copy.line,
    maxWidth: leftW,
    size: TYPE.label,
    fill: COLORS.inkMuted,
    maxLines: 1,
  });

  const tags = tagRow({
    x: x + pad,
    y: desc.bottomY + 20,
    labels: copy.labels.slice(0, 3),
    maxWidth: leftW,
    fontSize: TYPE.label,
    height: 30,
  });

  const ctaY = y + h - LAYOUT.safeBottom;
  const cta = ctaRow({
    xRight: x + w - pad,
    y: ctaY,
    label: projectCtaLabel(project),
  });

  let metricSvg = "";
  if (emphasized) {
    const mx = x + w - pad - 140;
    const status = formatSvgStatus(project.status);
    const r2 = formatSvgR2(globalR2);
    metricSvg = `
      <text ${textAttrs({
        x: mx,
        y: y + 28,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.1em",
      })}>STATUS</text>
      <text ${textAttrs({
        x: mx,
        y: y + 50,
        size: TYPE.label,
        fill: COLORS.coral,
        mono: true,
      })}>${escapeXml(status)}</text>
      <text ${textAttrs({
        x: mx,
        y: y + 78,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.1em",
      })}>GLOBAL R²</text>
      <text ${textAttrs({
        x: mx,
        y: y + 108,
        size: r2.available ? 26 : TYPE.label,
        fill: r2.available ? COLORS.coral : COLORS.inkMuted,
        mono: true,
        weight: 650,
      })}>${escapeXml(r2.text)}</text>
    `;
  }

  return `
    ${panelPath(x, y, w, h, 12, {
      stroke: emphasized ? COLORS.coral : COLORS.border,
      fillOpacity: emphasized ? 0.92 : 0.7,
      strokeOpacity: emphasized ? 0.55 : 0.9,
    })}
    ${emphasized ? ederHouseImage(x + pad, y + 16, 32) : ""}
    ${title.svg}
    ${desc.svg}
    ${tags.svg}
    ${metricSvg}
    ${cta}
  `;
}

export function renderWorkCard(data: ProfileData): string {
  const outer = LAYOUT.outerPad;
  const colGap = 16;
  const colW = Math.floor((880 - outer * 2 - colGap * 2) / 3);
  const buildY = 78;
  const buildH = 360;

  const columns = WHAT_I_BUILD.map((card, i) =>
    renderWhatIBuildColumn(
      card,
      outer + i * (colW + colGap),
      buildY,
      colW,
      buildH
    )
  ).join("");

  let y = buildY + buildH + 36;
  const projectsHeaderY = y;
  y += 56;

  const projectCards = data.projects.slice(0, 3).map((project) => {
    const h = project.emphasized ? 204 : 184;
    const card = renderProjectCard({
      project,
      x: outer,
      y,
      w: 880 - outer * 2,
      h,
      globalR2: data.eder.globalR2,
    });
    y += h + 14;
    return card;
  }).join("");

  const height = y + LAYOUT.outerPad;

  const body = `
    ${outerFrame(height)}
    ${watermark(720, 22, 110)}
    <text ${textAttrs({ x: outer, y: 40, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.18em" })}>PRACTICE</text>
    <text ${textAttrs({ x: outer, y: 68, size: TYPE.section, weight: 650 })}>What I Build</text>
    ${columns}
    <text ${textAttrs({ x: outer, y: projectsHeaderY, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.18em" })}>SELECTED WORK</text>
    <text ${textAttrs({ x: outer, y: projectsHeaderY + 28, size: TYPE.section, weight: 650 })}>Featured Projects</text>
    ${projectCards}
  `;

  return svgRoot({
    height,
    title: "What I build and featured projects",
    desc: "Three practice areas—engineering systems, data and intelligence, and digital products—plus featured projects Eder, Order Tracking App, and Reservoir Forecasting.",
    body,
  });
}
