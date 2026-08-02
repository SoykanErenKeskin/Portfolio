import { z } from "zod";

const projectRepoMappingSchema = z.object({
  projectId: z.string().min(1),
  displayName: z.string().min(1),
  activityLabel: z.string().min(1),
  /** Centralized GitHub repository slugs — empty is valid */
  repositories: z.array(z.string().min(1)),
});

const featuredProjectConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  architecture: z.array(z.string().min(1)),
  viewProjectHref: z.string().min(1),
  sourceHref: z.string().nullable(),
  technicalOverviewHref: z.string().nullable(),
  sourcePrivate: z.boolean(),
  showMetric: z.boolean(),
  metricLabel: z.string().optional(),
  emphasized: z.boolean().optional(),
});

const profileConfigSchema = z.object({
  version: z.string().min(1),
  githubUsername: z.string().min(1),
  commitsPerRepo: z.number().int().positive().max(20),
  maxActivityEntries: z.number().int().positive().max(10),
  identity: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    statement: z.string().min(1),
  }),
  eder: z.object({
    description: z.string().min(1),
    viewProjectHref: z.string().min(1),
    technicalOverviewHref: z.string().nullable(),
    sourcePrivate: z.boolean(),
  }),
  projectRepos: z.array(projectRepoMappingSchema),
  projects: z.array(featuredProjectConfigSchema),
  whatIBuild: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      modules: z.array(z.string().min(1)),
    })
  ),
  techMap: z.object({
    centerLabel: z.string().min(1),
    clusters: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        nodes: z.array(
          z.object({
            id: z.string().min(1),
            label: z.string().min(1),
            mark: z.string().min(1),
          })
        ),
      })
    ),
  }),
  contact: z.object({
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
  }),
});

export type ProfileConfig = z.infer<typeof profileConfigSchema>;

/**
 * File-based profile configuration.
 * Repository slugs are centralized here — adapters/UI never hardcode them.
 */
const rawProfileConfig = {
  version: "profile-v3",
  githubUsername: "SoykanErenKeskin",
  commitsPerRepo: 10,
  maxActivityEntries: 5,
  identity: {
    name: "SOYKAN EREN KESKIN",
    role: "Industrial Engineer building data-driven solutions",
    statement: "Solving complex systems through data and design.",
  },
  eder: {
    description:
      "Real estate intelligence powered by machine learning and local market data.",
    viewProjectHref: "/en/projects/kocaeli-real-estate",
    technicalOverviewHref: "/en/projects/kocaeli-real-estate",
    sourcePrivate: true,
  },
  projectRepos: [
    {
      projectId: "eder",
      displayName: "Eder",
      activityLabel: "EDER",
      // Exact slug not configured in codebase — leave empty (valid).
      repositories: [] as string[],
    },
    {
      projectId: "order-tracking",
      displayName: "Order Tracking App",
      activityLabel: "ORDER TRACKING APP",
      repositories: ["order-tracking-system"],
    },
    {
      projectId: "reservoir-forecasting",
      displayName: "Reservoir Forecasting",
      activityLabel: "RESERVOIR FORECASTING",
      repositories: [] as string[],
    },
  ],
  projects: [
    {
      id: "eder",
      title: "Eder",
      problem:
        "Real estate pricing data is fragmented, difficult to interpret, and often disconnected from regional context.",
      solution:
        "A machine learning-powered product that transforms property and local market data into understandable valuations and regional insights.",
      architecture: [
        "Machine learning valuation pipeline",
        "Regional analysis layer",
        "Snapshot-based public metrics",
        "Mobile product experience",
        "Automated data processing",
      ],
      viewProjectHref: "/en/projects/kocaeli-real-estate",
      sourceHref: null,
      technicalOverviewHref: "/en/projects/kocaeli-real-estate",
      sourcePrivate: true,
      showMetric: true,
      metricLabel: "GLOBAL MODEL R²",
      emphasized: true,
    },
    {
      id: "order-tracking",
      title: "Order Tracking App",
      problem:
        "Fragmented order and delivery workflows made operational tracking slow and difficult.",
      solution:
        "A role-based application that centralizes order management, delivery status, and operational reporting.",
      architecture: [
        "React Native",
        "PostgreSQL",
        "Role-based access",
        "Real-time status updates",
        "Reporting workflow",
      ],
      viewProjectHref: "/en/projects/order-tracking-system",
      // Public source URL omitted: configured tracking slug has no public matching repo.
      sourceHref: null,
      technicalOverviewHref: null,
      sourcePrivate: true,
      showMetric: false,
      emphasized: false,
    },
    {
      id: "reservoir-forecasting",
      title: "Reservoir Forecasting",
      problem:
        "Reservoir levels require reliable forecasting from historical and environmental time-series data.",
      solution:
        "A forecasting workflow designed to evaluate multiple reservoirs, model temporal behavior, and support comparative analysis.",
      architecture: [
        "Python",
        "Time-series processing",
        "Feature engineering",
        "Forecasting models",
        "Evaluation pipeline",
      ],
      viewProjectHref: "/en/projects",
      sourceHref: null,
      technicalOverviewHref: null,
      sourcePrivate: true,
      showMetric: false,
      emphasized: false,
    },
  ],
  whatIBuild: [
    {
      id: "engineering-systems",
      title: "Engineering Systems",
      description:
        "Designing structured, reliable systems that turn complex processes into clear workflows.",
      modules: ["PROCESS DESIGN", "SYSTEM ARCHITECTURE", "OPTIMIZATION"],
    },
    {
      id: "data-intelligence",
      title: "Data & Intelligence",
      description:
        "Building models and analytical pipelines that transform raw data into useful decisions.",
      modules: ["MACHINE LEARNING", "FEATURE ENGINEERING", "DECISION SUPPORT"],
    },
    {
      id: "digital-products",
      title: "Digital Products",
      description:
        "Turning technical solutions into accessible, well-designed products people can actually use.",
      modules: [
        "PRODUCT DESIGN",
        "FRONTEND DEVELOPMENT",
        "DATA VISUALIZATION",
      ],
    },
  ],
  techMap: {
    centerLabel: "ENGINEERING × DATA × PRODUCT",
    clusters: [
      {
        id: "data-intelligence",
        label: "Data & Intelligence",
        nodes: [
          { id: "python", label: "Python", mark: "Py" },
          { id: "pandas", label: "Pandas", mark: "Pd" },
          { id: "sklearn", label: "Scikit-learn", mark: "Sk" },
          { id: "xgboost", label: "XGBoost", mark: "Xg" },
        ],
      },
      {
        id: "product-dev",
        label: "Product Development",
        nodes: [
          { id: "typescript", label: "TypeScript", mark: "Ts" },
          { id: "react", label: "React", mark: "Re" },
          { id: "react-native", label: "React Native", mark: "Rn" },
          { id: "nextjs", label: "Next.js", mark: "Nx" },
        ],
      },
      {
        id: "infra",
        label: "Infrastructure & Workflow",
        nodes: [
          { id: "postgresql", label: "PostgreSQL", mark: "Pg" },
          { id: "git", label: "Git", mark: "Gt" },
        ],
      },
    ],
  },
  contact: {
    statement:
      "Good products begin with understanding the system behind the problem.",
    openTo: "meaningful problems, ambitious products, thoughtful collaboration",
    connect: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/soykanerenkeskin",
      },
      { label: "Portfolio", href: "/en" },
      { label: "Email", href: "mailto:soykanerenkeskin@gmail.com" },
    ],
    status: "available for new conversations",
    prompt: "connect with soykan_",
  },
} as const;

let cachedConfig: ProfileConfig | null = null;

export function getProfileConfig(): ProfileConfig {
  if (cachedConfig) return cachedConfig;
  const parsed = profileConfigSchema.safeParse({
    ...rawProfileConfig,
    githubUsername:
      process.env.GITHUB_USERNAME?.trim() || rawProfileConfig.githubUsername,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid profile config: ${parsed.error.issues.map((i) => i.message).join("; ")}`
    );
  }
  cachedConfig = parsed.data;
  return cachedConfig;
}

/** Unique non-empty repository slugs from config (for GitHub adapter). */
export function getConfiguredRepositorySlugs(config = getProfileConfig()): string[] {
  const set = new Set<string>();
  for (const mapping of config.projectRepos) {
    for (const slug of mapping.repositories) {
      const trimmed = slug.trim();
      if (trimmed) set.add(trimmed);
    }
  }
  return [...set];
}

export function findProjectMappingForRepo(
  repoName: string,
  config = getProfileConfig()
) {
  const lower = repoName.toLowerCase();
  return (
    config.projectRepos.find((m) =>
      m.repositories.some((r) => r.toLowerCase() === lower)
    ) ?? null
  );
}
