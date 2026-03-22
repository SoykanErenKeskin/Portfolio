import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCase } from "@/components/projects/project-case";
import { getMessages } from "@/lib/i18n";
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
