import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProjectRegistry } from "@/components/projects/project-registry";
import { RegistryFallback } from "@/components/projects/registry-fallback";
import { getMessages } from "@/lib/i18n";
import { getAllProjects, getAllTechTags } from "@/lib/projects";
import { isLocale } from "@/types/locale";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = getMessages(locale);
  const [projects, allTags] = await Promise.all([
    getAllProjects({ publishedOnly: true }),
    getAllTechTags(),
  ]);

  return (
    <Suspense fallback={<RegistryFallback />}>
      <ProjectRegistry
        locale={locale}
        messages={messages}
        projects={projects}
        allTags={allTags}
      />
    </Suspense>
  );
}
