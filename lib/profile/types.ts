/** Normalized GitHub profile experience data. */

export type ProfileSourceStatus = "ok" | "fallback" | "error";

export type ProfileIdentity = {
  name: string;
  role: string;
  statement: string;
};

export type EderProfile = {
  projectName: "EDER";
  description: string;
  projectStatus: string | null;
  scope: string | null;
  globalR2: number | null;
  modelVersion: string | null;
  /** Snapshot publish / data-as-of timestamp */
  snapshotUpdatedAt: string | null;
  /** GitHub-first meaningful update; falls back to snapshotUpdatedAt */
  latestMeaningfulUpdate: string | null;
  isActive: boolean;
  viewProjectHref: string;
  technicalOverviewHref: string | null;
  sourcePrivate: boolean;
};

export type WhatIBuildCard = {
  id: string;
  title: string;
  description: string;
  modules: string[];
};

export type FeaturedProject = {
  id: string;
  title: string;
  problem: string;
  solution: string;
  architecture: string[];
  viewProjectHref: string;
  sourceHref: string | null;
  technicalOverviewHref: string | null;
  showMetric: boolean;
  metricLabel?: string;
  metricValue?: string | null;
  status?: string | null;
  latestMeaningfulUpdate?: string | null;
  emphasized?: boolean;
};

export type ActivityItem = {
  text: string;
};

export type ActivityGroup = {
  projectKey: string;
  projectLabel: string;
  items: ActivityItem[];
  relativeTime: string;
};

export type TechNode = {
  id: string;
  label: string;
  mark: string;
};

export type TechCluster = {
  id: string;
  label: string;
  nodes: TechNode[];
};

export type TechMapSpec = {
  centerLabel: string;
  clusters: TechCluster[];
};

export type ContactTerminalSpec = {
  statement: string;
  openTo: string;
  connect: { label: string; href: string }[];
  status: string;
  prompt: string;
};

export type ProfileData = {
  version: string;
  generatedAt: string;
  identity: ProfileIdentity;
  eder: EderProfile;
  whatIBuild: WhatIBuildCard[];
  projects: FeaturedProject[];
  activity: ActivityGroup[];
  techMap: TechMapSpec;
  contact: ContactTerminalSpec;
  meta: {
    sources: {
      github: ProfileSourceStatus;
      eder: ProfileSourceStatus;
    };
  };
};
