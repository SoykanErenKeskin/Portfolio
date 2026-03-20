import type { Locale } from "./locale";

/** Bilingual field: same keys as supported locales */
export type LocalizedString = Record<Locale, string>;

/** Modular block for technical structure section */
export type TechnicalBlock = {
  key: string;
  label: LocalizedString;
  content: LocalizedString;
};

export type ProjectLinks = {
  github?: string;
  live?: string;
};

export type ProjectImage = {
  src: string;
  alt: LocalizedString;
  /** When "video", gallery renders <video> instead of <img> */
  type?: "image" | "video";
};

export type ProjectDataTable = {
  /** Section title */
  title?: LocalizedString;
  /** Column headers (sub-columns) */
  columns: string[];
  /** Optional top-level group headers: { label, colspan } */
  columnGroups?: { label: string; colspan: number }[];
  /** Data rows: metric group, scenario, and cell values */
  rows: {
    metric: string;
    scenario: string;
    values: (string | number)[];
  }[];
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
  /** Domain / area (e.g. Recommendation Systems) */
  domain?: LocalizedString;
  /** Focus areas (e.g. Model Comparison, Data Analysis) */
  focus?: LocalizedString;
  /** Project status; defaults to Completed when omitted */
  status?: LocalizedString;
  /** Modular technical breakdown blocks */
  technicalStructure?: TechnicalBlock[];
  /** Structured data table (e.g. model comparison metrics) */
  dataTable?: ProjectDataTable;
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
