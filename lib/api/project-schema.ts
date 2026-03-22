import { z } from "zod";

const localizedSchema = z.object({
  en: z.string(),
  tr: z.string(),
});

const technicalBlockSchema = z.object({
  key: z.string(),
  label: localizedSchema,
  content: localizedSchema,
});

const dataTableSchema = z.object({
  title: localizedSchema.optional(),
  columns: z.array(z.string()),
  columnGroups: z.array(z.object({ label: z.string(), colspan: z.number() })).optional(),
  rows: z.array(
    z.object({
      metric: z.string(),
      scenario: z.string(),
      values: z.array(z.union([z.string(), z.number()])),
    })
  ),
});

const linksSchema = z.object({
  github: z.string().optional(),
  live: z.string().optional(),
  videoUrl: z.string().optional(),
});

const imageSchema = z.object({
  src: z.string().min(1),
  alt: localizedSchema.optional(),
  type: z.enum(["image", "video"]).optional(),
});

export const createProjectSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens only"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  title: localizedSchema,
  shortDescription: localizedSchema,
  summary: localizedSchema,
  domain: localizedSchema.optional(),
  focus: localizedSchema.optional(),
  problem: localizedSchema,
  approach: localizedSchema,
  outcome: localizedSchema,
  detail: localizedSchema.optional(),
  statusLabel: localizedSchema.optional(),
  technicalStructure: z.array(technicalBlockSchema).optional(),
  dataTable: dataTableSchema.optional(),
  tech: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  images: z.array(imageSchema).default([]),
  links: linksSchema.optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
