import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import { quaroxNodeSvg, textAttrs, truncate } from "@/lib/profile/svg/helpers";
import { outerFrame, svgRoot, watermark } from "@/lib/profile/svg/layout";

export function renderSystemCard(data: ProfileData): string {
  const activityY = 78;
  let activityBlock: string;

  if (!data.activity.length) {
    activityBlock = `
      <path d="M36,${activityY} L420,${activityY} L432,${activityY + 12} L432,${activityY + 210} L48,${activityY + 210} L36,${activityY + 198} Z" fill="${COLORS.bgDeep}" fill-opacity="0.75" stroke="${COLORS.border}" stroke-width="1.1"/>
      <text ${textAttrs({ x: 56, y: activityY + 32, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.14em" })}>SYSTEM ACTIVITY</text>
      <text ${textAttrs({ x: 56, y: activityY + 110, size: TYPE.body, fill: COLORS.inkMuted, mono: true })}>NO RECENT MEANINGFUL ACTIVITY</text>
    `;
  } else {
    let y = activityY + 52;
    const rows = data.activity.slice(0, 5).flatMap((group) => {
      const header = `
        <text ${textAttrs({ x: 56, y, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.1em" })}>&gt; ${escapeXml(group.projectLabel)}</text>
      `;
      y += 24;
      const items = group.items.map((item, idx) => {
        const isLast = idx === group.items.length - 1;
        const line = `
          <text ${textAttrs({ x: 72, y, size: TYPE.label, fill: COLORS.inkMuted, mono: true })}>${escapeXml(truncate(item.text, 42))}${
            isLast
              ? `  ·  ${escapeXml(group.relativeTime)}`
              : ""
          }</text>
        `;
        y += 22;
        return line;
      });
      y += 10;
      return [header, ...items];
    });

    const panelH = Math.max(210, y - activityY + 16);
    activityBlock = `
      <path d="M36,${activityY} L420,${activityY} L432,${activityY + 12} L432,${activityY + panelH} L48,${activityY + panelH} L36,${activityY + panelH - 12} Z" fill="${COLORS.bgDeep}" fill-opacity="0.75" stroke="${COLORS.border}" stroke-width="1.1"/>
      <text ${textAttrs({ x: 56, y: activityY + 32, size: TYPE.label, fill: COLORS.inkFaint, mono: true, letterSpacing: "0.14em" })}>SYSTEM ACTIVITY</text>
      ${rows.join("")}
    `;
  }

  // Tech map right side
  const techX = 460;
  const techY = 78;
  const clusters = data.techMap.clusters.slice(0, 3);
  const clusterBlocks = clusters
    .map((cluster, ci) => {
      const cy = techY + 100 + ci * 62;
      const nodes = cluster.nodes
        .slice(0, 4)
        .map((node, ni) => {
          const nx = techX + 20 + (ni % 2) * 180;
          const ny = cy + 28 + Math.floor(ni / 2) * 28;
          return `<text ${textAttrs({ x: nx, y: ny, size: TYPE.label, fill: COLORS.ink, mono: true })}>• ${escapeXml(node.label)}</text>`;
        })
        .join("");
      return `
        <text ${textAttrs({ x: techX + 20, y: cy + 8, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.1em" })}>${escapeXml(cluster.label.toUpperCase())}</text>
        ${nodes}
      `;
    })
    .join("");

  const techBlock = `
    <path d="M448,${techY} L844,${techY} L856,${techY + 12} L856,${techY + 290} L460,${techY + 290} L448,${techY + 278} Z" fill="${COLORS.bgDeep}" fill-opacity="0.75" stroke="${COLORS.border}" stroke-width="1.1"/>
    <line x1="650" y1="${techY + 54}" x2="560" y2="${techY + 90}" stroke="${COLORS.coral}" stroke-opacity="0.35" stroke-width="1"/>
    <line x1="650" y1="${techY + 54}" x2="740" y2="${techY + 90}" stroke="${COLORS.coral}" stroke-opacity="0.35" stroke-width="1"/>
    <text ${textAttrs({ x: 652, y: techY + 36, size: TYPE.label, fill: COLORS.ink, mono: true, weight: 600, anchor: "middle", letterSpacing: "0.04em" })}>${escapeXml(truncate(data.techMap.centerLabel, 34))}</text>
    ${quaroxNodeSvg(650, techY + 58, 0.55)}
    ${clusterBlocks}
  `;

  const contactY = 400;
  const openTo = truncate(
    data.contact.openTo.replace(
      "ambitious products, thoughtful collaboration",
      "thoughtful collaboration"
    ),
    56
  );

  const contactBlock = `
    <path d="M36,${contactY} L844,${contactY} L856,${contactY + 12} L856,${contactY + 118} L48,${contactY + 118} L36,${contactY + 106} Z" fill="${COLORS.bgDeep}" fill-opacity="0.8" stroke="${COLORS.border}" stroke-width="1.1"/>
    <text ${textAttrs({ x: 56, y: contactY + 36, size: TYPE.body, fill: COLORS.inkMuted })}>${escapeXml(truncate(data.contact.statement, 78))}</text>
    <text ${textAttrs({ x: 56, y: contactY + 66, size: TYPE.label, fill: COLORS.inkMuted, mono: true })}>&gt; open_to: ${escapeXml(openTo)}</text>
    <text ${textAttrs({ x: 56, y: contactY + 90, size: TYPE.label, fill: COLORS.inkMuted, mono: true })}>&gt; connect: LinkedIn · Portfolio · Email</text>
    <text ${textAttrs({ x: 56, y: contactY + 112, size: TYPE.label, fill: COLORS.ink, mono: true })}>&gt; ${escapeXml(data.contact.prompt)}</text>
  `;

  const height = contactY + 140;

  const body = `
    ${outerFrame(height)}
    ${watermark(700, height - 40, 130)}
    <text ${textAttrs({ x: 44, y: 42, size: TYPE.label, fill: COLORS.coral, mono: true, letterSpacing: "0.18em" })}>FEED · STACK · SIGNAL</text>
    <text ${textAttrs({ x: 44, y: 70, size: TYPE.section, weight: 650 })}>System</text>
    ${activityBlock}
    ${techBlock}
    ${contactBlock}
  `;

  return svgRoot({
    height,
    title: "System activity, technology map, and contact",
    desc: "Recent meaningful project activity, a technology map for engineering data and product work, and a contact terminal for Soykan Eren Keskin.",
    body,
  });
}
