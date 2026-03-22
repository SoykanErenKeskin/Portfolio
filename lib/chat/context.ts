import { profile } from "@/data/profile";
import type { ProjectRecord } from "@/types/project";
import type { ProfileRow } from "@/lib/db/profile";
import type { FaqRow } from "@/lib/db/faq";
import type { LearningEntry } from "@/lib/db/learning-timeline";

/** DATA bölümü için varsayılan metin – comprehensiveContext + ek detaylar */
export function getDefaultProfileData(): string {
  const comprehensive =
    (profile as typeof profile & { comprehensiveContext?: string }).comprehensiveContext ?? "";
  const p = profile as typeof profile & { thequarox?: string };
  const lines = [
    comprehensive ? `## COMPREHENSIVE PROFILE\n${comprehensive}\n` : "",
    "## WEBSITES",
    `Personal portfolio: ${profile.website}`,
    p.thequarox ? `The Quarox (business/consulting, NOT personal): ${p.thequarox}` : "",
    "",
    "## EDUCATION",
    ...profile.education,
    "",
    "## EXPERIENCE",
    ...profile.experience,
    "",
    "## SKILLS",
    `Technical: ${profile.skills.technical.join(", ")}`,
    `Analytics: ${profile.skills.analytics.join(", ")}`,
    `Core: ${profile.skills.core.join(", ")}`,
    "",
    "## LANGUAGES",
    ...profile.languages.map((l) => `${l.lang}: ${l.level}`),
    "",
    "## CAREER INTERESTS",
    profile.careerInterests,
    "",
    "## GROWTH AREAS (use for weaknesses questions – keep short)",
    ...profile.growthAreas,
  ].filter(Boolean);
  return lines.join("\n");
}

function buildProfileSection(profiles: ProfileRow[]): string {
  if (profiles.length === 0) return "No profile on file.";
  return profiles
    .map((p) => {
      const parts = [
        "## PROFILE",
        `Name: ${p.name}`,
        `Tagline: ${p.tagline}`,
        p.value_prop && `Value proposition: ${p.value_prop}`,
        p.supporting && `Supporting: ${p.supporting}`,
        `Email: ${p.email}`,
        `GitHub: ${p.github}`,
        `LinkedIn: ${p.linkedin}`,
        `Website: ${p.website}`,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");
}

function buildFaqSection(faq: FaqRow[]): string {
  if (faq.length === 0) return "";
  const byLocale = { en: [] as FaqRow[], tr: [] as FaqRow[] };
  faq.forEach((f) => {
    if (f.locale in byLocale) (byLocale as Record<string, FaqRow[]>)[f.locale].push(f);
  });
  return ["en", "tr"]
    .map((loc) => {
      const items = (byLocale as Record<string, FaqRow[]>)[loc] ?? [];
      if (items.length === 0) return "";
      return [
        `## FAQ (${loc.toUpperCase()})`,
        ...items.map((f) => `Q: ${f.question}\nA: ${f.answer}`),
      ].join("\n\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

function buildLearningTimelineSection(entries: LearningEntry[]): string {
  if (entries.length === 0) return "";
  const byYear = entries.reduce<Record<number, string[]>>((acc, e) => {
    if (!acc[e.year]) acc[e.year] = [];
    acc[e.year].push(`${e.toolEn} (${e.level})`);
    return acc;
  }, {});
  const lines = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)
    .map((y) => `${y}: ${(byYear[y] ?? []).join(", ")}`);
  return ["## LEARNING TIMELINE (when tech/tools were learned)", ...lines].join("\n");
}

function buildProjectsText(projects: ProjectRecord[]): string {
  if (projects.length === 0) return "No projects on file.";
  return projects
    .map((p) => {
      const title = p.title.en || p.title.tr || p.slug;
      const summary = p.summary?.en || p.summary?.tr || "";
      const problem = p.problem?.en || p.problem?.tr || "";
      const approach = p.approach?.en || p.approach?.tr || "";
      const outcome = p.outcome?.en || p.outcome?.tr || "";
      const tech = (p.tech ?? []).join(", ");
      const tools = (p.tools ?? []).join(", ");
      return [
        `--- ${title} ---`,
        `Summary: ${summary}`,
        problem && `Problem: ${problem}`,
        approach && `Approach: ${approach}`,
        outcome && `Outcome: ${outcome}`,
        tech && `Tech: ${tech}`,
        tools && `Tools: ${tools}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

/** Chatbot için DATA + profil + FAQ + projeler + learning timeline context metnini üretir */
export function getChatContext(
  projects: ProjectRecord[],
  profiles: ProfileRow[],
  faq: FaqRow[],
  dataOverride?: string | null,
  learningTimeline?: LearningEntry[]
): string {
  const dataSection = dataOverride?.trim() || getDefaultProfileData();
  const profileSection = buildProfileSection(profiles);
  const faqSection = buildFaqSection(faq);
  const projectsText = buildProjectsText(projects);
  const learningSection = buildLearningTimelineSection(learningTimeline ?? []);

  const parts = [
    "=== PORTFOLIO DATA (use only this to answer) ===",
    "",
    dataSection,
    "",
    profileSection,
  ];
  if (faqSection) parts.push("", faqSection);
  if (learningSection) parts.push("", learningSection);
  parts.push("", "=== PROJECTS ===", projectsText);

  return parts.join("\n");
}
