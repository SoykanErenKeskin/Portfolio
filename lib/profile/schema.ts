import { z } from "zod";

export const profileSourceStatusSchema = z.enum(["ok", "fallback", "error"]);

export const profileIdentitySchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  statement: z.string().min(1),
});

export const ederProfileSchema = z.object({
  projectName: z.literal("EDER"),
  description: z.string().min(1),
  projectStatus: z.string().nullable(),
  scope: z.string().nullable(),
  globalR2: z.number().finite().nullable(),
  modelVersion: z.string().nullable(),
  snapshotUpdatedAt: z.string().nullable(),
  latestMeaningfulUpdate: z.string().nullable(),
  isActive: z.boolean(),
  viewProjectHref: z.string().min(1),
  technicalOverviewHref: z.string().nullable(),
  sourcePrivate: z.boolean(),
});

export const whatIBuildCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  modules: z.array(z.string().min(1)),
});

export const featuredProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  architecture: z.array(z.string().min(1)),
  viewProjectHref: z.string().min(1),
  sourceHref: z.string().nullable(),
  technicalOverviewHref: z.string().nullable(),
  showMetric: z.boolean(),
  metricLabel: z.string().optional(),
  metricValue: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  latestMeaningfulUpdate: z.string().nullable().optional(),
  emphasized: z.boolean().optional(),
});

export const activityItemSchema = z.object({
  text: z.string().min(1),
});

export const activityGroupSchema = z.object({
  projectKey: z.string().min(1),
  projectLabel: z.string().min(1),
  items: z.array(activityItemSchema),
  relativeTime: z.string().min(1),
});

/** Flat pipeline item before UI grouping */
export const meaningfulActivityItemSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  displayText: z.string().min(1),
  sourceTimestamp: z.string().min(1),
  repositoryUrl: z.string().nullable(),
});

export const techNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  mark: z.string().min(1),
});

export const techClusterSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  nodes: z.array(techNodeSchema),
});

export const techMapSpecSchema = z.object({
  centerLabel: z.string().min(1),
  clusters: z.array(techClusterSchema),
});

export const contactTerminalSpecSchema = z.object({
  statement: z.string().min(1),
  openTo: z.string().min(1),
  connect: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    })
  ),
  status: z.string().min(1),
  prompt: z.string().min(1),
});

export const profileDataSchema = z.object({
  version: z.string().min(1),
  generatedAt: z.string().min(1),
  identity: profileIdentitySchema,
  eder: ederProfileSchema,
  whatIBuild: z.array(whatIBuildCardSchema),
  projects: z.array(featuredProjectSchema),
  activity: z.array(activityGroupSchema),
  techMap: techMapSpecSchema,
  contact: contactTerminalSpecSchema,
  meta: z.object({
    sources: z.object({
      github: profileSourceStatusSchema,
      eder: profileSourceStatusSchema,
    }),
  }),
});

export type ProfileDataParsed = z.infer<typeof profileDataSchema>;
export type MeaningfulActivityItem = z.infer<typeof meaningfulActivityItemSchema>;
