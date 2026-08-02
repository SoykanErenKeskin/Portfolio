import type { ProfileData } from "@/lib/profile/types";
import { getProfileData } from "@/lib/profile/get-profile-data";
import {
  renderFallbackCard,
  type SvgBlockId,
} from "@/lib/profile/svg/fallback";

const CACHE_HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  // Short shared cache so Hostinger/CDN picks up visual releases quickly.
  // README still cache-busts with ?v=profile-v*
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function respondProfileSvg(
  block: SvgBlockId,
  render: (data: ProfileData) => string
): Promise<Response> {
  // ?v= is intentionally ignored for data selection (Phase 4 cache bust only)
  let data: ProfileData | null = null;
  try {
    data = await getProfileData();
    const svg = render(data);
    return new Response(svg, {
      status: 200,
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    console.error(`[profile-svg:${block}] generation failed`, error);
    return new Response(renderFallbackCard(block, data?.identity), {
      status: 200,
      headers: CACHE_HEADERS,
    });
  }
}
