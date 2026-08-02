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
  linesText,
  textAttrs,
  truncate,
  wrapActivityLine,
} from "@/lib/profile/svg/helpers";
import {
  clipRect,
  outerShell,
  panelPath,
  svgRoot,
} from "@/lib/profile/svg/layout";

export const SYSTEM_HEIGHT = SVG_CANVAS.systemMinHeight;

const PAD = 28;
const PANEL_X = 28;
const PANEL_W = 824;

export function renderSystemCard(data: ProfileData): string {
  let y = 72;
  const defsParts: string[] = [];

  // —— Activity console ——
  const activityX = PANEL_X;
  const activityW = PANEL_W;
  let activityInner = "";
  let activityH = 0;

  if (!data.activity.length) {
    activityH = 96;
    activityInner = `
      <line x1="${activityX}" y1="${y + 40}" x2="${activityX + activityW}" y2="${y + 40}" stroke="${COLORS.borderSubtle}" stroke-width="1"/>
      <text ${textAttrs({
        x: activityX + 18,
        y: y + 26,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.18em",
        id: "system-activity-label",
      })}>SYSTEM ACTIVITY</text>
      <text ${textAttrs({
        x: activityX + activityW - 18,
        y: y + 26,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        anchor: "end",
      })}>LIVE FEED</text>
      <text ${textAttrs({
        x: activityX + 18,
        y: y + 68,
        size: GP_TYPE.body,
        fill: COLORS.inkMuted,
        mono: true,
        id: "system-activity-empty",
      })}>NO RECENT MEANINGFUL ACTIVITY</text>
    `;
  } else {
    let cursor = y + 56;
    const rows: string[] = [
      `<line x1="${activityX}" y1="${y + 40}" x2="${activityX + activityW}" y2="${y + 40}" stroke="${COLORS.borderSubtle}" stroke-width="1"/>`,
      `<text ${textAttrs({
        x: activityX + 18,
        y: y + 26,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.18em",
        id: "system-activity-label",
      })}>SYSTEM ACTIVITY</text>`,
      `<text ${textAttrs({
        x: activityX + activityW - 18,
        y: y + 26,
        size: GP_TYPE.eyebrow,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: GP_TRACKING.label,
        anchor: "end",
      })}>LIVE FEED</text>`,
    ];
    for (const group of data.activity.slice(0, 3)) {
      rows.push(
        `<text ${textAttrs({
          x: activityX + 18,
          y: cursor,
          size: GP_TYPE.label,
          fill: COLORS.coral,
          mono: true,
          letterSpacing: "0.1em",
        })}><tspan fill="${COLORS.inkFaint}">&gt;</tspan> ${escapeXml(group.projectLabel)}</text>`
      );
      cursor += 22;
      for (const item of group.items.slice(0, 2)) {
        const line = wrapActivityLine(item.text, 70, 1)[0] ?? truncate(item.text, 70);
        rows.push(
          `<text ${textAttrs({
            x: activityX + 34,
            y: cursor,
            size: GP_TYPE.bodySm,
            fill: COLORS.inkMuted,
            mono: true,
          })}>${escapeXml(line)}</text>`
        );
        cursor += 20;
      }
      rows.push(
        `<text ${textAttrs({
          x: activityX + 34,
          y: cursor,
          size: GP_TYPE.eyebrow,
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
      ${panelPath(activityX, y, activityW, activityH, GP_CUT.lg)}
      ${activityInner}
    </g>
  `;
  y += activityH + 28;

  // —— Technology map (organic static network) ——
  const techY = y;
  const techH = 420;
  const techClip = "clip-system-tech";
  defsParts.push(clipRect(techClip, PANEL_X, techY, PANEL_W, techH));
  const cx = PANEL_X + PANEL_W / 2;
  const clusters = data.techMap.clusters.slice(0, 3);
  const clusterW = 248;
  const clusterGap = 20;
  const clustersStartX =
    PANEL_X +
    (PANEL_W - (clusterW * clusters.length + clusterGap * (clusters.length - 1))) /
      2;
  const clusterY = techY + 120;

  const clusterCards = clusters
    .map((cluster, i) => {
      const x = clustersStartX + i * (clusterW + clusterGap);
      const nodes = cluster.nodes.slice(0, 4);
      const nodeRows = nodes
        .map((node, ni) => {
          const ny = clusterY + 40 + ni * 36;
          return `
            <rect x="${x + 12}" y="${ny}" width="${clusterW - 24}" height="30" fill="${COLORS.bgDeep}" fill-opacity="0.7" stroke="${COLORS.borderSubtle}" stroke-width="1"/>
            <rect x="${x + 18}" y="${ny + 5}" width="20" height="20" fill="none" stroke="${COLORS.coral}" stroke-opacity="0.35" stroke-width="1"/>
            <text ${textAttrs({
              x: x + 28,
              y: ny + 19,
              size: GP_TYPE.mark,
              fill: COLORS.coral,
              mono: true,
              anchor: "middle",
            })}>${escapeXml(node.mark.slice(0, 2))}</text>
            <text ${textAttrs({
              x: x + 46,
              y: ny + 20,
              size: GP_TYPE.bodySm,
              fill: COLORS.ink,
              id:
                i === 0 && ni === 0
                  ? "system-tech-data-items"
                  : undefined,
            })}>${escapeXml(node.label)}</text>
          `;
        })
        .join("");

      const clusterH = 40 + nodes.length * 36 + 16;
      return `
        <line x1="${cx}" y1="${techY + 78}" x2="${x + clusterW / 2}" y2="${clusterY}" stroke="${COLORS.coral}" stroke-opacity="0.32" stroke-width="1"/>
        ${panelPath(x, clusterY, clusterW, clusterH, GP_CUT.sm)}
        <text ${textAttrs({
          x: x + 14,
          y: clusterY + 24,
          size: GP_TYPE.eyebrow,
          fill: COLORS.coral,
          mono: true,
          letterSpacing: GP_TRACKING.label,
          id: i === 0 ? "system-tech-data-heading" : undefined,
        })}>${escapeXml(cluster.label.toUpperCase())}</text>
        ${nodeRows}
      `;
    })
    .join("");

  const techPanel = `
    <g clip-path="url(#${techClip})">
      ${panelPath(PANEL_X, techY, PANEL_W, techH, GP_CUT.lg)}
      ${panelPath(cx - 150, techY + 28, 300, 44, GP_CUT.sm, {
        stroke: COLORS.coral,
        strokeOpacity: 0.45,
        fill: COLORS.bgDeep,
      })}
      <text ${textAttrs({
        x: cx,
        y: techY + 56,
        size: GP_TYPE.label,
        fill: COLORS.ink,
        mono: true,
        weight: 600,
        anchor: "middle",
        letterSpacing: "0.12em",
        id: "system-tech-center",
      })}>${escapeXml(truncate(data.techMap.centerLabel, 34))}</text>
      ${clusterCards}
    </g>
  `;
  y += techH + 28;

  // —— Contact terminal ——
  const contactY = y;
  const contactH = 200;
  const contactClip = "clip-system-contact";
  defsParts.push(clipRect(contactClip, PANEL_X, contactY, PANEL_W, contactH));
  const openTo = truncate(data.contact.openTo, 72);
  const connectLabels = data.contact.connect.map((c) => c.label).join(" · ");

  const contactPanel = `
    <g clip-path="url(#${contactClip})">
      ${panelPath(PANEL_X, contactY, PANEL_W, contactH, GP_CUT.lg)}
      <line x1="${PANEL_X}" y1="${contactY + 64}" x2="${PANEL_X + PANEL_W}" y2="${contactY + 64}" stroke="${COLORS.borderSubtle}" stroke-width="1"/>
      ${linesText({
        x: PANEL_X + 22,
        y: contactY + 28,
        lines: wrapActivityLine(data.contact.statement, 68, 2),
        size: GP_TYPE.body,
        lineHeight: 24,
        fill: COLORS.inkMuted,
        id: "system-contact-statement",
      })}
      <text ${textAttrs({
        x: PANEL_X + 22,
        y: contactY + 92,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        mono: true,
        id: "system-contact-open-to",
      })}><tspan fill="${COLORS.coral}">&gt;</tspan> open_to: <tspan fill="${COLORS.ink}">${escapeXml(openTo)}</tspan></text>
      <text ${textAttrs({
        x: PANEL_X + 22,
        y: contactY + 116,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        mono: true,
        id: "system-contact-connect",
      })}><tspan fill="${COLORS.coral}">&gt;</tspan> connect: <tspan fill="${COLORS.ink}">${escapeXml(connectLabels)}</tspan></text>
      <text ${textAttrs({
        x: PANEL_X + 22,
        y: contactY + 140,
        size: GP_TYPE.bodySm,
        fill: COLORS.inkMuted,
        mono: true,
        id: "system-contact-status",
      })}><tspan fill="${COLORS.coral}">&gt;</tspan> status: <tspan fill="${COLORS.ink}">${escapeXml(data.contact.status)}</tspan></text>
      <text ${textAttrs({
        x: PANEL_X + 22,
        y: contactY + 176,
        size: GP_TYPE.bodySm,
        fill: COLORS.ink,
        mono: true,
        id: "system-contact-prompt",
      })}><tspan fill="${COLORS.coral}">&gt;</tspan> ${escapeXml(data.contact.prompt)}</text>
      <rect x="${PANEL_X + 22 + Math.min(220, data.contact.prompt.length * 9)}" y="${contactY + 164}" width="8" height="14" fill="${COLORS.coral}"/>
    </g>
  `;
  y += contactH + PAD;

  const height = Math.max(SYSTEM_HEIGHT, y);

  // Section headers outside panels (preview language)
  const body = `
    ${outerShell(height)}
    <text ${textAttrs({
      x: PAD,
      y: 34,
      size: GP_TYPE.eyebrow,
      fill: COLORS.coral,
      mono: true,
      letterSpacing: GP_TRACKING.eyebrow,
      id: "system-eyebrow",
    })}>FEED · STACK · SIGNAL</text>
    <text ${textAttrs({
      x: PAD,
      y: 60,
      size: GP_TYPE.section,
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
    desc: "Activity console, technology network, and contact terminal aligned with the admin profile preview.",
    defs: defsParts.join(""),
    body,
  });
}
