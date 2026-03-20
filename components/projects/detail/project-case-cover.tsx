import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectImage } from "@/types/project";
import { ProjectAssetImage } from "@/components/projects/detail/project-asset-image";

export function ProjectCaseCover({
  cover,
  locale,
  messages: m,
}: {
  cover: ProjectImage | null;
  locale: Locale;
  messages: Messages;
}) {
  return (
    <section aria-label={m.projectDetail.caseCover}>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        {m.projectDetail.caseCover}
      </p>
      <div className="panel-edge overflow-hidden bg-surface-raised">
        {cover ? (
          <div className="px-4 py-5 sm:px-8 sm:py-6">
            <ProjectAssetImage
              src={cover.src}
              alt={cover.alt[locale]}
              variant="cover"
              priority
              fallbackLabel={m.projectDetail.noImageAsset}
            />
            <div className="mt-4 border-t border-border pt-3">
              <p className="font-mono text-[10px] text-ink-faint">
                {cover.alt[locale]}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center px-4 py-10">
            <p className="font-mono text-[11px] text-ink-faint">
              {m.projectDetail.coverPlaceholder}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
