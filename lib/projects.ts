/**
 * Public project data access.
 * Uses database for persistence. For type helpers and filtering, see below.
 */
import type { ProjectRecord } from "@/types/project";

export { getAllProjects, getProjectById, getLatestProjects, getAdjacentProjects, getAllTechTags } from "./db/projects";

/** Client-side filter by tech tags */
export function filterProjectsByTags(
  projects: ProjectRecord[],
  tags: string[]
): ProjectRecord[] {
  if (tags.length === 0) return projects;
  const set = new Set(tags);
  return projects.filter((p) => p.tech.some((t) => set.has(t)));
}
