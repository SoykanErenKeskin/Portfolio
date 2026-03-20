import { ProjectCaseCover } from "@/components/projects/detail/project-case-cover";
import { ProjectDataTable } from "@/components/projects/detail/project-data-table";
import { ProjectCaseHeader } from "@/components/projects/detail/project-case-header";
import { ProjectGallery } from "@/components/projects/detail/project-gallery";
import { ProjectMetaPanel } from "@/components/projects/detail/project-meta-panel";
import { ProjectSection } from "@/components/projects/detail/project-section";
import { RelatedProjects } from "@/components/projects/detail/related-projects";
import { TechnicalBlock } from "@/components/projects/detail/technical-block";
import { splitCoverAndGallery } from "@/lib/project-images";
import type { Locale } from "@/types/locale";
import type { Messages } from "@/types/messages";
import type { ProjectRecord } from "@/types/project";

export function ProjectCase({
  locale,
  messages: m,
  project: p,
  prevProject,
  nextProject,
}: {
  locale: Locale;
  messages: Messages;
  project: ProjectRecord;
  prevProject: ProjectRecord | null;
  nextProject: ProjectRecord | null;
}) {
  const { cover, gallery } = splitCoverAndGallery(p.images);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <ProjectCaseHeader locale={locale} messages={m} project={p} />

      <div className="mt-8 space-y-8">
        <ProjectMetaPanel locale={locale} messages={m} project={p} />

        <ProjectCaseCover cover={cover} locale={locale} messages={m} />

        <ProjectSection title={m.projectDetail.problem}>
          <p>{p.problem[locale]}</p>
        </ProjectSection>

        <ProjectSection title={m.projectDetail.approach}>
          <p>{p.approach[locale]}</p>
        </ProjectSection>

        {p.technicalStructure && p.technicalStructure.length > 0 && (
          <section>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {m.projectDetail.technicalStructure}
            </h2>
            <TechnicalBlock blocks={p.technicalStructure} locale={locale} />
          </section>
        )}

        <ProjectSection title={m.projectDetail.outcome}>
          <p>{p.outcome[locale]}</p>
        </ProjectSection>

        {p.dataTable && (
          <ProjectDataTable table={p.dataTable} locale={locale} />
        )}

        <ProjectGallery
          images={gallery}
          locale={locale}
          messages={m}
        />

        <RelatedProjects
          prev={prevProject}
          next={nextProject}
          locale={locale}
          messages={m}
        />
      </div>
    </article>
  );
}
