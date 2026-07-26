import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCase } from "@/components/projects/project-case";
import { KocaeliRealEstateCase } from "@/components/projects/cases/kocaeli-real-estate/kocaeli-real-estate-case";
import { KOCAELI_CASE_ID } from "@/content/cases/kocaeli-real-estate/copy";
import { getMessages } from "@/lib/i18n";
import { getKocaeliSnapshot } from "@/lib/kocaeli-real-estate/get-snapshot";
import {
  getPublishedProjectById,
  getAdjacentProjects,
} from "@/lib/db/projects";
import { isLocale } from "@/types/locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  const project = await getPublishedProjectById(id);
  if (!project) return {};
  return {
    title: project.title[locale],
    description: project.summary[locale],
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const project = await getPublishedProjectById(id);
  if (!project) notFound();

  const { prev, next } = await getAdjacentProjects(id);
  const messages = getMessages(locale);

  if (id === KOCAELI_CASE_ID || project.slug === KOCAELI_CASE_ID) {
    const snapshot = await getKocaeliSnapshot();
    return (
      <KocaeliRealEstateCase
        locale={locale}
        messages={messages}
        project={project}
        prevProject={prev}
        nextProject={next}
        snapshot={snapshot}
      />
    );
  }

  return (
    <ProjectCase
      locale={locale}
      messages={messages}
      project={project}
      prevProject={prev}
      nextProject={next}
    />
  );
}
