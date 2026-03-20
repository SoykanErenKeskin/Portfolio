import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCase } from "@/components/projects/project-case";
import { getMessages } from "@/lib/i18n";
import { getAllProjects, getProjectById } from "@/lib/projects";
import { isLocale } from "@/types/locale";
import { locales } from "@/types/locale";

export function generateStaticParams() {
  const projects = getAllProjects();
  return locales.flatMap((locale) =>
    projects.map((p) => ({ locale, id: p.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  const project = getProjectById(id);
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

  const project = getProjectById(id);
  if (!project) notFound();

  const messages = getMessages(locale);

  return <ProjectCase locale={locale} messages={messages} project={project} />;
}
