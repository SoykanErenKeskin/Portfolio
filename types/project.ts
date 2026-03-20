import type { Locale } from "./locale";

/** Bilingual field: same keys as supported locales */
export type LocalizedString = Record<Locale, string>;

export type ProjectLinks = {
  github?: string;
  live?: string;
};

export type ProjectImage = {
  src: string;
  alt: LocalizedString;
};

export type ProjectRecord = {
  id: string;
  /** URL slug; falls back to id when omitted */
  slug?: string;
  /** ISO 8601 date string (used for sorting and display) */
  date: string;
  tech: string[];
  tools: string[];
  images: ProjectImage[];
  links?: ProjectLinks;
  title: LocalizedString;
  shortDescription: LocalizedString;
  summary: LocalizedString;
  /** Problem / Approach / Outcome structure */
  problem: LocalizedString;
  approach: LocalizedString;
  outcome: LocalizedString;
  /** Legacy freeform detail; optional when problem/approach/outcome exist */
  detail?: LocalizedString;
  /** Highlight in home/featured sections */
  featured?: boolean;
};

export type ProjectsFile = {
  projects: ProjectRecord[];
};
