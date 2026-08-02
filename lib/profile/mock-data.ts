import type { ProfileData } from "@/lib/profile/types";

/** Phase 1 static payload — replaced by getProfileData() in Phase 2. */
export const mockProfileData: ProfileData = {
  version: "phase1-mock",
  generatedAt: "2026-08-01T21:00:00.000Z",
  identity: {
    name: "SOYKAN EREN KESKIN",
    role: "Industrial Engineer building data-driven solutions",
    statement: "Solving complex systems through data and design.",
  },
  eder: {
    projectName: "EDER",
    description:
      "Real estate intelligence powered by machine learning and local market data.",
    projectStatus: "Active development",
    scope: "Global model",
    globalR2: 0.65,
    modelVersion: "full_v24",
    snapshotUpdatedAt: "2026-07-28T14:00:00.000Z",
    latestMeaningfulUpdate: "2026-08-01T12:30:00.000Z",
    isActive: true,
    viewProjectHref: "/en/projects/kocaeli-real-estate",
    technicalOverviewHref: "/en/projects/kocaeli-real-estate",
    sourcePrivate: true,
  },
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
      modules: ["PRODUCT DESIGN", "FRONTEND DEVELOPMENT", "DATA VISUALIZATION"],
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
      showMetric: true,
      metricLabel: "GLOBAL MODEL R²",
      metricValue: "0.65",
      status: "Active development",
      latestMeaningfulUpdate: "2026-08-01T12:30:00.000Z",
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
      sourceHref: null,
      technicalOverviewHref: null,
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
      showMetric: false,
      emphasized: false,
    },
  ],
  activity: [
    {
      projectKey: "eder",
      projectLabel: "EDER",
      items: [
        { text: "improved valuation pipeline" },
        { text: "refreshed regional insight flow" },
        { text: "synced model snapshot" },
      ],
      relativeTime: "2h ago",
    },
    {
      projectKey: "order-tracking",
      projectLabel: "ORDER TRACKING APP",
      items: [
        { text: "refined delivery state management" },
        { text: "improved operational reporting" },
      ],
      relativeTime: "4d ago",
    },
    {
      projectKey: "reservoir-forecasting",
      projectLabel: "RESERVOIR FORECASTING",
      items: [{ text: "updated forecasting experiments" }],
      relativeTime: "8d ago",
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
  meta: {
    sources: {
      github: "fallback",
      eder: "fallback",
    },
  },
};
