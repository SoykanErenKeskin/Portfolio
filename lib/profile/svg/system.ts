import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import {
  LAYOUT,
  panelPath,
  renderWrappedText,
} from "@/lib/profile/svg/flow";
import { quaroxNodeSvg, textAttrs, truncate } from "@/lib/profile/svg/helpers";
import { outerFrame, svgRoot, watermark } from "@/lib/profile/svg/layout";

function clusterBlock(opts: {
  x: number;
  y: number;
  w: number;
  label: string;
  nodes: { label: string }[];
}): { svg: string; y: number; bottomY: number } {
  const heading = `<text ${textAttrs({
    x: opts.x,
    y: opts.y,
    size: TYPE.label,
    fill: COLORS.coral,
    mono: true,
    letterSpacing: "0.1em",
  })}>${escapeXml(opts.label.toUpperCase())}</text>`;

  const lines = opts.nodes.slice(0, 4).map((node, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const nx = opts.x + col * (opts.w / 2);
    const ny = opts.y + 32 + row * 28;
    return `<text ${textAttrs({
      x: nx,
      y: ny,
      size: TYPE.label,
      fill: COLORS.ink,
      mono: true,
    })}>• ${escapeXml(node.label)}</text>`;
  });

  const rows = Math.ceil(Math.min(opts.nodes.length, 4) / 2);
  const bottomY = opts.y + 32 + Math.max(1, rows) * 28;
  return { svg: `${heading}${lines.join("")}`, y: opts.y, bottomY };
}

export function renderSystemCard(data: ProfileData): string {
  const pad = LAYOUT.outerPad;
  let y = 70;

  // Activity on top (full width when empty is compact; otherwise expands)
  const activityX = pad;
  const activityW = 880 - pad * 2;
  let activityInner = "";
  let activityH = 0;

  if (!data.activity.length) {
    activityH = 78;
    activityInner = `
      <text ${textAttrs({
        x: activityX + 16,
        y: y + 24,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.14em",
      })}>SYSTEM ACTIVITY</text>
      <text ${textAttrs({
        x: activityX + 16,
        y: y + 48,
        size: TYPE.body,
        fill: COLORS.inkMuted,
        mono: true,
      })}>NO RECENT MEANINGFUL ACTIVITY</text>
      <text ${textAttrs({
        x: activityX + 16,
        y: y + 68,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
      })}>Waiting for configured project activity</text>
    `;
  } else {
    let cursor = y + 40;
    const rows: string[] = [
      `<text ${textAttrs({
        x: activityX + 18,
        y: y + 28,
        size: TYPE.label,
        fill: COLORS.inkFaint,
        mono: true,
        letterSpacing: "0.14em",
      })}>SYSTEM ACTIVITY</text>`,
    ];
    for (const group of data.activity.slice(0, 5)) {
      rows.push(
        `<text ${textAttrs({
          x: activityX + 18,
          y: cursor,
          size: TYPE.label,
          fill: COLORS.coral,
          mono: true,
          letterSpacing: "0.08em",
        })}>&gt; ${escapeXml(group.projectLabel)}</text>`
      );
      cursor += 24;
      group.items.forEach((item, idx) => {
        const last = idx === group.items.length - 1;
        rows.push(
          `<text ${textAttrs({
            x: activityX + 34,
            y: cursor,
            size: TYPE.label,
            fill: COLORS.inkMuted,
            mono: true,
          })}>${escapeXml(truncate(item.text, 56))}${
            last ? `  ·  ${escapeXml(group.relativeTime)}` : ""
          }</text>`
        );
        cursor += 22;
      });
      cursor += 8;
    }
    activityH = cursor - y + 12;
    activityInner = rows.join("");
  }

  const activityPanel = `
    ${panelPath(activityX, y, activityW, activityH, 12)}
    ${activityInner}
  `;
  y += activityH + 18;

  // Tech map — spatial clusters
  const techY = y;
  const techX = pad;
  const techW = activityW;
  const cx = techX + techW / 2;
  const cy = techY + 56;

  const dataCluster = data.techMap.clusters.find((c) =>
    c.id.includes("data")
  ) ?? data.techMap.clusters[0]!;
  const productCluster = data.techMap.clusters.find((c) =>
    c.id.includes("product")
  ) ?? data.techMap.clusters[1]!;
  const infraCluster = data.techMap.clusters.find((c) =>
    c.id.includes("infra")
  ) ?? data.techMap.clusters[2]!;

  const left = clusterBlock({
    x: techX + 28,
    y: techY + 118,
    w: 300,
    label: dataCluster.label,
    nodes: dataCluster.nodes,
  });
  const right = clusterBlock({
    x: techX + techW - 328,
    y: techY + 118,
    w: 300,
    label: productCluster.label,
    nodes: productCluster.nodes,
  });
  const bottom = clusterBlock({
    x: cx - 150,
    y: Math.max(left.bottomY, right.bottomY) + 36,
    w: 300,
    label: infraCluster.label,
    nodes: infraCluster.nodes,
  });
  const techH = bottom.bottomY - techY + 28;

  const techPanel = `
    ${panelPath(techX, techY, techW, techH, 12)}
    <text ${textAttrs({
      x: cx,
      y: techY + 36,
      size: TYPE.label,
      fill: COLORS.ink,
      mono: true,
      weight: 600,
      anchor: "middle",
      letterSpacing: "0.06em",
    })}>${escapeXml(truncate(data.techMap.centerLabel, 36))}</text>
    ${quaroxNodeSvg(cx, cy + 8, 0.7)}
    <line x1="${cx - 20}" y1="${cy + 20}" x2="${techX + 120}" y2="${techY + 118}" stroke="${COLORS.coral}" stroke-opacity="0.35" stroke-width="1"/>
    <line x1="${cx + 20}" y1="${cy + 20}" x2="${techX + techW - 120}" y2="${techY + 118}" stroke="${COLORS.coral}" stroke-opacity="0.35" stroke-width="1"/>
    <line x1="${cx}" y1="${cy + 28}" x2="${cx}" y2="${bottom.y}" stroke="${COLORS.coral}" stroke-opacity="0.35" stroke-width="1"/>
    ${left.svg}
    ${right.svg}
    ${bottom.svg}
  `;
  y += techH + 16;

  // Contact strip — compact, flow-based height
  const statement = renderWrappedText({
    x: pad + 20,
    y: y + 32,
    text: data.contact.statement,
    maxWidth: activityW - 48,
    size: TYPE.body,
    fill: COLORS.inkMuted,
    maxLines: 2,
    lineHeight: 28,
  });
  const openToY = statement.bottomY + 26;
  const openTo = `
    <text ${textAttrs({
      x: pad + 20,
      y: openToY,
      size: TYPE.label,
      fill: COLORS.inkMuted,
      mono: true,
    })}>&gt; open_to: meaningful problems</text>
    <text ${textAttrs({
      x: pad + 20,
      y: openToY + 22,
      size: TYPE.label,
      fill: COLORS.inkMuted,
      mono: true,
    })}>  and thoughtful collaboration</text>
  `;
  const connectY = openToY + 48;
  const contactH = connectY - y + 56;
  const contactPanel = `
    ${panelPath(pad, y, activityW, contactH, 12)}
    ${statement.svg}
    ${openTo}
    <text ${textAttrs({
      x: pad + 20,
      y: connectY,
      size: TYPE.label,
      fill: COLORS.inkMuted,
      mono: true,
    })}>&gt; connect: LinkedIn · Portfolio · Email</text>
    <text ${textAttrs({
      x: pad + 20,
      y: connectY + 24,
      size: TYPE.label,
      fill: COLORS.ink,
      mono: true,
    })}>&gt; ${escapeXml(data.contact.prompt)}</text>
  `;
  y += contactH + pad;

  const height = y;

  const body = `
    ${outerFrame(height)}
    ${watermark(730, height - 48, 100)}
    <text ${textAttrs({ x: pad, y: 38, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.18em" })}>FEED · STACK · SIGNAL</text>
    <text ${textAttrs({ x: pad, y: 64, size: TYPE.section, weight: 650 })}>System</text>
    ${activityPanel}
    ${techPanel}
    ${contactPanel}
  `;

  return svgRoot({
    height,
    title: "System activity, technology map, and contact",
    desc: "Recent meaningful project activity, a technology map for engineering data and product work, and a contact terminal for Soykan Eren Keskin.",
    body,
  });
}
