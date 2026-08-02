import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  assertInBounds,
  linesText,
  textAttrs,
  truncate,
  wrapActivityLine,
} from "@/lib/profile/svg/helpers";
import {
  clipRect,
  outerFrame,
  panelPath,
  quaroxNodesImage,
  svgRoot,
} from "@/lib/profile/svg/layout";

export const SYSTEM_HEIGHT = 760;

const PAD = 32;
const PANEL_X = 32;
const PANEL_W = 816;

const TECH_CLUSTERS = [
  {
    id: "data",
    heading: "DATA & INTELLIGENCE",
    items: "Python · Pandas · Scikit-learn · XGBoost",
  },
  {
    id: "product",
    heading: "PRODUCT DEVELOPMENT",
    items: "TypeScript · React · React Native · Next.js",
  },
  {
    id: "infra",
    heading: "INFRASTRUCTURE & WORKFLOW",
    items: "PostgreSQL · Git",
  },
] as const;

export function renderSystemCard(data: ProfileData): string {
  assertInBounds("system-panel", PANEL_X + PANEL_W, 880, PANEL_X);

  let y = 78;
  const defsParts: string[] = [];

  // —— Activity (full width, compact when empty; max 3 groups) ——
  const activityX = PANEL_X;
  const activityW = PANEL_W;
  let activityInner = "";
  let activityH = 0;

  if (!data.activity.length) {
    activityH = 82;
    activityInner = `
      <text ${textAttrs({
        x: activityX + 20,
        y: y + 24,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.14em",
        id: "system-activity-label",
      })}>SYSTEM ACTIVITY</text>
      <text ${textAttrs({
        x: activityX + 20,
        y: y + 50,
        size: TYPE.body,
        fill: COLORS.inkMuted,
        mono: true,
        id: "system-activity-empty",
      })}>NO RECENT MEANINGFUL ACTIVITY</text>
      <text ${textAttrs({
        x: activityX + 20,
        y: y + 70,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        id: "system-activity-hint",
      })}>Configured project activity will appear here.</text>
    `;
  } else {
    let cursor = y + 36;
    const rows: string[] = [
      `<text ${textAttrs({
        x: activityX + 20,
        y: y + 26,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.14em",
        id: "system-activity-label",
      })}>SYSTEM ACTIVITY</text>`,
    ];
    for (const group of data.activity.slice(0, 3)) {
      rows.push(
        `<text ${textAttrs({
          x: activityX + 20,
          y: cursor,
          size: TYPE.label,
          fill: COLORS.coral,
          mono: true,
          letterSpacing: "0.08em",
        })}>&gt; ${escapeXml(group.projectLabel)}</text>`
      );
      cursor += 24;
      for (const item of group.items.slice(0, 2)) {
        const lines = wrapActivityLine(item.text, 64, 1);
        rows.push(
          `<text ${textAttrs({
            x: activityX + 36,
            y: cursor,
            size: TYPE.label,
            fill: COLORS.inkMuted,
            mono: true,
          })}>${escapeXml(lines[0] ?? truncate(item.text, 64))}</text>`
        );
        cursor += 22;
      }
      rows.push(
        `<text ${textAttrs({
          x: activityX + 36,
          y: cursor,
          size: TYPE.label,
          fill: COLORS.inkFaint,
          mono: true,
        })}>${escapeXml(group.relativeTime)}</text>`
      );
      cursor += 28;
    }
    activityH = cursor - y + 12;
    activityInner = rows.join("");
  }

  const activityClip = "clip-system-activity";
  defsParts.push(clipRect(activityClip, activityX, y, activityW, activityH));
  const activityPanel = `
    <g clip-path="url(#${activityClip})">
      ${panelPath(activityX, y, activityW, activityH, 12)}
      ${activityInner}
    </g>
  `;
  y += activityH + 20;

  // —— Technology (vertical clusters, one node icon) ——
  const techY = y;
  const techHeaderH = 100;
  const clusterH = 70;
  const techH = techHeaderH + TECH_CLUSTERS.length * clusterH + 16;
  const techClip = "clip-system-tech";
  defsParts.push(clipRect(techClip, PANEL_X, techY, PANEL_W, techH));

  const cx = PANEL_X + PANEL_W / 2;
  const clustersSvg = TECH_CLUSTERS.map((cluster, i) => {
    const cy = techY + techHeaderH + i * clusterH;
    return `
      <text ${textAttrs({
        x: PANEL_X + 24,
        y: cy + 24,
        size: TYPE.label,
        fill: COLORS.coral,
        mono: true,
        letterSpacing: "0.1em",
        id: `system-tech-${cluster.id}-heading`,
      })}>${escapeXml(cluster.heading)}</text>
      <text ${textAttrs({
        x: PANEL_X + 24,
        y: cy + 50,
        size: TYPE.label,
        fill: COLORS.ink,
        mono: true,
        id: `system-tech-${cluster.id}-items`,
      })}>${escapeXml(cluster.items)}</text>
    `;
  }).join("");

  const techPanel = `
    <g clip-path="url(#${techClip})">
      ${panelPath(PANEL_X, techY, PANEL_W, techH, 12)}
      <text ${textAttrs({
        x: cx,
        y: techY + 28,
        size: TYPE.label,
        fill: COLORS.ink,
        mono: true,
        weight: 600,
        anchor: "middle",
        letterSpacing: "0.06em",
        id: "system-tech-center",
      })}>ENGINEERING × DATA × PRODUCT</text>
      ${quaroxNodesImage(cx - 26, techY + 36, 52, "system-quarox-node")}
      <line x1="${cx}" y1="${techY + 90}" x2="${cx}" y2="${techY + techHeaderH}" stroke="${COLORS.coral}" stroke-opacity="0.3" stroke-width="1"/>
      ${clustersSvg}
    </g>
  `;
  y += techH + 18;

  // —— Contact ——
  const contactY = y;
  const contactH = 168;
  const contactClip = "clip-system-contact";
  defsParts.push(clipRect(contactClip, PANEL_X, contactY, PANEL_W, contactH));

  const contactPanel = `
    <g clip-path="url(#${contactClip})">
      ${panelPath(PANEL_X, contactY, PANEL_W, contactH, 12)}
      ${linesText({
        x: PANEL_X + 24,
        y: contactY + 32,
        lines: [
          "Good products begin with understanding",
          "the system behind the problem.",
        ],
        size: TYPE.body,
        lineHeight: 28,
        fill: COLORS.inkMuted,
        id: "system-contact-statement",
      })}
      <text ${textAttrs({
        x: PANEL_X + 24,
        y: contactY + 104,
        size: TYPE.label,
        fill: COLORS.inkMuted,
        mono: true,
        id: "system-contact-open-to",
      })}>&gt; open_to: meaningful problems and thoughtful collaboration</text>
      <text ${textAttrs({
        x: PANEL_X + 24,
        y: contactY + 126,
        size: TYPE.label,
        fill: COLORS.inkMuted,
        mono: true,
        id: "system-contact-connect",
      })}>&gt; connect: LinkedIn · Portfolio · Email</text>
      <text ${textAttrs({
        x: PANEL_X + 24,
        y: contactY + 148,
        size: TYPE.label,
        fill: COLORS.ink,
        mono: true,
        id: "system-contact-prompt",
      })}>&gt; ${escapeXml(data.contact.prompt)}</text>
    </g>
  `;
  y += contactH + PAD;

  const height = Math.max(SYSTEM_HEIGHT, y);

  // Watermark omitted on System card — safer than a clipped mark.
  const body = `
    ${outerFrame(height)}
    <text ${textAttrs({
      x: PAD,
      y: 40,
      size: TYPE.label,
      fill: COLORS.coral,
      mono: true,
      letterSpacing: "0.18em",
      id: "system-eyebrow",
    })}>FEED · STACK · SIGNAL</text>
    <text ${textAttrs({
      x: PAD,
      y: 68,
      size: TYPE.section,
      weight: 650,
      id: "system-heading",
    })}>System</text>
    ${activityPanel}
    ${techPanel}
    ${contactPanel}
  `;

  return svgRoot({
    height,
    title: "System activity, technology map, and contact",
    desc: "Recent meaningful project activity, technology clusters, and contact terminal for Soykan Eren Keskin.",
    defs: defsParts.join(""),
    body,
  });
}
