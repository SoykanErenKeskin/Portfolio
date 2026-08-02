import type { ProfileData } from "@/lib/profile/types";
import { COLORS, TYPE } from "@/lib/profile/svg/constants";
import { escapeXml } from "@/lib/profile/svg/escape";
import { textAttrs } from "@/lib/profile/svg/helpers";
import { outerFrame, svgRoot } from "@/lib/profile/svg/layout";

export type SvgBlockId = "hero" | "work" | "system";

const BLOCK_HEIGHT: Record<SvgBlockId, number> = {
  hero: 320,
  work: 560,
  system: 460,
};

const BLOCK_TITLE: Record<SvgBlockId, string> = {
  hero: "Soykan Eren Keskin — profile card temporarily unavailable",
  work: "What I build and featured projects — temporarily unavailable",
  system: "Activity, technology, and contact — temporarily unavailable",
};

/** Safe fallback SVG when generation fails unexpectedly. */
export function renderFallbackCard(
  block: SvgBlockId,
  identity?: ProfileData["identity"]
): string {
  const height = BLOCK_HEIGHT[block];
  const name = identity?.name ?? "SOYKAN EREN KESKIN";
  const role =
    identity?.role ?? "Industrial Engineer building data-driven solutions";

  const body = `
    ${outerFrame(height)}
    <text ${textAttrs({ x: 48, y: 72, size: TYPE.name, weight: 650 })}>${escapeXml(name)}</text>
    <text ${textAttrs({ x: 48, y: 108, size: TYPE.body, fill: COLORS.inkMuted })}>${escapeXml(role)}</text>
    <text ${textAttrs({ x: 48, y: 160, size: TYPE.bodySecondary, fill: COLORS.inkFaint, mono: true })}>Live details temporarily unavailable</text>
  `;

  return svgRoot({
    height,
    title: BLOCK_TITLE[block],
    desc: "Fallback profile card. Live profile details are temporarily unavailable.",
    body,
  });
}
