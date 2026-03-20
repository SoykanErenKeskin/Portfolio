import type { ProjectRecord } from "@/types/project";
import type { ProjectsFile } from "@/types/project";
import data from "@/content/projects.json";

const file = data as ProjectsFile;

export function getAllProjects(): ProjectRecord[] {
  return [...file.projects].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getProjectById(id: string): ProjectRecord | undefined {
  return file.projects.find((p) => p.id === id);
}

export function getLatestProjects(count: number): ProjectRecord[] {
  return getAllProjects().slice(0, count);
}

export function getAllTechTags(): string[] {
  const set = new Set<string>();
  for (const p of file.projects) {
    for (const t of p.tech) set.add(t);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterProjectsByTags(
  projects: ProjectRecord[],
  tags: string[]
): ProjectRecord[] {
  if (tags.length === 0) return projects;
  const set = new Set(tags);
  return projects.filter((p) => p.tech.some((t) => set.has(t)));
}
