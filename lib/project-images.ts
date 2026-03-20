import type { ProjectImage } from "@/types/project";

function hasValidSrc(img: ProjectImage): boolean {
  return typeof img.src === "string" && img.src.trim().length > 0;
}

export function splitCoverAndGallery(images: ProjectImage[]): {
  cover: ProjectImage | null;
  gallery: ProjectImage[];
} {
  const valid = images.filter(hasValidSrc);
  if (!valid.length) return { cover: null, gallery: [] };
  const cover =
    valid.find((x) => x.type !== "video") ?? valid[0]!;
  const coverIdx = valid.indexOf(cover);
  const gallery = valid.filter((_, i) => i !== coverIdx);
  return { cover, gallery };
}

/** Safe external link: non-empty after trim */
export function isValidLink(url: string | undefined): url is string {
  return typeof url === "string" && url.trim().length > 0;
}
