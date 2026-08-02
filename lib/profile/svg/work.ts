import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  formatSvgR2,
  quaroxNodeSvg,
  textAttrs,
  truncate,
} from "@/lib/profile/svg/helpers";
import {
  ederHouseImage,
  outerFrame,
  svgRoot,
  watermark,
} from "@/lib/profile/svg/layout";

const WHAT_I_BUILD_SVG = [
  {
    title: "Engineering Systems",
    line1: "Structured systems for",
    line2: "complex workflows.",
    modules: ["PROCESS DESIGN", "SYSTEM ARCHITECTURE", "OPTIMIZATION"],
  },
  {
    title: "Data & Intelligence",
    line1: "Models and pipelines that",
    line2: "support useful decisions.",
    modules: ["MACHINE LEARNING", "FEATURE ENGINEERING", "DECISION SUPPORT"],
  },
  {
    title: "Digital Products",
    line1: "Technical solutions shaped",
    line2: "into usable products.",
    modules: ["PRODUCT DESIGN", "FRONTEND DEVELOPMENT", "DATA VISUALIZATION"],
  },
] as const;

const PROJECT_SVG: Record<
  string,
  { line: string; labels: string[]; cta: string }
> = {
  eder: {
    line: "ML valuation and regional market intelligence.",
    labels: ["ML VALUATION", "REGIONAL INSIGHTS", "DATA PIPELINE"],
    cta: "VIEW PROJECT  ·  TECHNICAL OVERVIEW",
  },
  "order-tracking": {
    line: "Role-based order and delivery tracking.",
    labels: ["REACT NATIVE", "POSTGRESQL", "ROLE ACCESS"],
    cta: "VIEW PROJECT  ·  SOURCE",
  },
  "reservoir-forecasting": {
    line: "Time-series forecasting for reservoir systems.",
    labels: ["PYTHON", "TIME SERIES", "MODEL EVAL"],
    cta: "VIEW PROJECT  ·  SOURCE",
  },
};

export function renderWorkCard(data: ProfileData): string {
  const columns = WHAT_I_BUILD_SVG.map((card, i) => {
    const x = 36 + i * 280;
    const modules = card.modules
      .map((m, mi) => {
        const my = 196 + mi * 34;
        return `
          <rect x="${x + 14}" y="${my}" width="240" height="28" fill="none" stroke="${COLORS.border}" stroke-width="1"/>
          <text ${textAttrs({ x: x + 22, y: my + 19, size: TYPE.label, fill: COLORS.inkMuted, mono: true, letterSpacing: "0.08em" })}>${escapeXml(m)}</text>
        `;
      })
      .join("");
    return `
      <path d="M${x},78 L${x + 256},78 L${x + 268},90 L${x + 268},308 L${x + 12},308 L${x},296 Z" fill="${COLORS.bgDeep}" fill-opacity="0.72" stroke="${COLORS.border}" stroke-width="1"/>
      ${quaroxNodeSvg(x + 38, 108, 0.72)}
      <text ${textAttrs({ x: x + 64, y: 114, size: 22, weight: 650 })}>${escapeXml(card.title)}</text>
      <text ${textAttrs({ x: x + 14, y: 148, size: TYPE.label, fill: COLORS.inkMuted })}>${escapeXml(card.line1)}</text>
      <text ${textAttrs({ x: x + 14, y: 170, size: TYPE.label, fill: COLORS.inkMuted })}>${escapeXml(card.line2)}</text>
      ${modules}
    `;
  }).join("");

  const rowH = 118;
  const projectsStart = 360;
  const projects = data.projects.slice(0, 3).map((project, index) => {
    const meta = PROJECT_SVG[project.id] ?? {
      line: truncate(project.solution, 52),
      labels: project.architecture
        .slice(0, 3)
        .map((a) => a.toUpperCase().slice(0, 14)),
      cta: "VIEW PROJECT",
    };
    const y = projectsStart + index * rowH;
    const emphasized = Boolean(project.emphasized);
    const stroke = emphasized ? COLORS.coral : COLORS.border;
    const r2 =
      project.showMetric && project.id === "eder"
        ? formatSvgR2(data.eder.globalR2)
        : null;
    const labels = meta.labels
      .slice(0, 3)
      .map((label, li) => {
        const lx = 56 + li * 200;
        return `
          <rect x="${lx}" y="${y + 60}" width="184" height="30" fill="none" stroke="${COLORS.border}" stroke-width="1"/>
          <text ${textAttrs({ x: lx + 10, y: y + 80, size: TYPE.label, fill: COLORS.inkMuted, mono: true, letterSpacing: "0.06em" })}>${escapeXml(truncate(label, 18))}</text>
        `;
      })
      .join("");

    return `
      <path d="M36,${y} L844,${y} L856,${y + 12} L856,${y + 108} L48,${y + 108} L36,${y + 96} Z" fill="${COLORS.bgDeep}" fill-opacity="${emphasized ? 0.92 : 0.68}" stroke="${stroke}" stroke-opacity="${emphasized ? 0.55 : 0.85}" stroke-width="1.15"/>
      ${emphasized ? ederHouseImage(48, y + 14, 34) : ""}
      <text ${textAttrs({ x: emphasized ? 94 : 56, y: y + 36, size: 24, weight: 650 })}>${escapeXml(project.title)}</text>
      ${
        project.status
          ? `<text ${textAttrs({ x: 700, y: y + 36, size: TYPE.label, fill: COLORS.coral, mono: true, anchor: "end", letterSpacing: "0.1em" })}>${escapeXml(truncate(project.status.toUpperCase(), 16))}</text>`
          : ""
      }
      ${
        r2
          ? `<text ${textAttrs({ x: 820, y: y + 36, size: TYPE.label, fill: r2.available ? COLORS.coral : COLORS.inkMuted, mono: true, weight: 650, anchor: "end" })}>R² ${escapeXml(r2.text)}</text>`
          : ""
      }
      <text ${textAttrs({ x: 56, y: y + 56, size: TYPE.label, fill: COLORS.inkMuted })}>${escapeXml(meta.line)}</text>
      ${labels}
      <text ${textAttrs({ x: 820, y: y + 100, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.08em", anchor: "end" })}>${escapeXml(meta.cta)}</text>
    `;
  }).join("");

  const height = projectsStart + 3 * rowH + 20;

  const body = `
    ${outerFrame(height)}
    ${watermark(690, 24, 140)}
    <text ${textAttrs({ x: 44, y: 42, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.18em" })}>PRACTICE</text>
    <text ${textAttrs({ x: 44, y: 70, size: TYPE.section, weight: 650 })}>What I Build</text>
    ${columns}
    <text ${textAttrs({ x: 44, y: 340, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.18em" })}>SELECTED WORK</text>
    <text ${textAttrs({ x: 220, y: 342, size: TYPE.section, weight: 650 })}>Featured Projects</text>
    ${projects}
  `;

  return svgRoot({
    height,
    title: "What I build and featured projects",
    desc: "Three practice areas—engineering systems, data and intelligence, and digital products—plus featured projects Eder, Order Tracking App, and Reservoir Forecasting.",
    body,
  });
}
