import { ProjectAssetImage } from "@/components/projects/detail/project-asset-image";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectImage } from "@/types/project";

export function ProjectGallery({
  images,
  locale,
  messages: m,
}: {
  images: ProjectImage[];
  locale: Locale;
  messages: Messages;
}) {
  if (images.length === 0) return null;
  const hasVideo = images.some((x) => x.type === "video");

  return (
    <section aria-label={m.projectDetail.gallery}>
      <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        {m.projectDetail.gallery}
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {images.map((img, i) => (
          <figure
            key={`${img.src}-${i}`}
            className="panel-edge flex flex-col overflow-hidden bg-surface-raised"
          >
            <div className="px-3 pt-4 sm:px-5 sm:pt-5">
              {img.type === "video" ? (
                <div
                  className={cn(
                    "w-full overflow-hidden rounded",
                    hasVideo && "aspect-video lg:max-h-[min(85vh,600px)]"
                  )}
                >
                  <video
                    src={img.src}
                    controls
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                hasVideo ? (
                  <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded lg:max-h-[min(85vh,600px)]">
                    <ProjectAssetImage
                      src={img.src}
                      alt={img.alt[locale]}
                      variant="gallery"
                      fallbackLabel={m.projectDetail.noImageAsset}
                      fillContainer
                    />
                  </div>
                ) : (
                  <ProjectAssetImage
                    src={img.src}
                    alt={img.alt[locale]}
                    variant="gallery"
                    fallbackLabel={m.projectDetail.noImageAsset}
                  />
                )
              )}
            </div>
            <figcaption className="border-t border-border px-3 py-2.5 font-mono text-[10px] text-ink-faint sm:px-5">
              {img.alt[locale]}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
