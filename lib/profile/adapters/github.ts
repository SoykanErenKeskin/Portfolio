import "server-only";

import {
  findProjectMappingForRepo,
  getConfiguredRepositorySlugs,
  getProfileConfig,
  type ProfileConfig,
} from "@/lib/profile/config";
import type { RawCommitInput } from "@/lib/profile/activity";
import type { ProfileSourceStatus } from "@/lib/profile/types";

export type GitHubRepoSnapshot = {
  name: string;
  url: string;
  isPrivate: boolean;
  pushedAt: string | null;
};

export type GitHubAdapterResult = {
  source: ProfileSourceStatus;
  repositories: GitHubRepoSnapshot[];
  commits: RawCommitInput[];
};

type HistoryNode = {
  messageHeadline?: string | null;
  committedDate?: string | null;
};

type RepoNode = {
  name?: string | null;
  url?: string | null;
  isPrivate?: boolean | null;
  pushedAt?: string | null;
  defaultBranchRef?: {
    target?: {
      history?: {
        nodes?: (HistoryNode | null)[] | null;
      } | null;
    } | null;
  } | null;
};

function buildReposQuery(slugs: string[], commitsPerRepo: number): string {
  const fields = slugs
    .map((slug, index) => {
      const alias = `r${index}`;
      // GraphQL name argument must be a string literal for static query building
      const safeName = slug.replace(/\\/g, "").replace(/"/g, "");
      return `
      ${alias}: repository(owner: $owner, name: "${safeName}") {
        name
        url
        isPrivate
        pushedAt
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: ${commitsPerRepo}) {
                nodes {
                  messageHeadline
                  committedDate
                }
              }
            }
          }
        }
      }`;
    })
    .join("\n");

  return `
    query ProfileRepos($owner: String!) {
      ${fields}
    }
  `;
}

function parseAdapterPayload(
  data: Record<string, RepoNode | null | undefined>,
  slugs: string[],
  config: ProfileConfig
): Pick<GitHubAdapterResult, "repositories" | "commits"> {
  const repositories: GitHubRepoSnapshot[] = [];
  const commits: RawCommitInput[] = [];

  slugs.forEach((slug, index) => {
    const node = data[`r${index}`];
    if (!node?.name) return;

    const url = typeof node.url === "string" ? node.url : null;
    repositories.push({
      name: node.name,
      url: url ?? `https://github.com/${config.githubUsername}/${slug}`,
      isPrivate: Boolean(node.isPrivate),
      pushedAt: typeof node.pushedAt === "string" ? node.pushedAt : null,
    });

    const mapping = findProjectMappingForRepo(node.name, config);
    if (!mapping) return;

    const nodes = node.defaultBranchRef?.target?.history?.nodes ?? [];
    for (const commit of nodes) {
      if (!commit?.messageHeadline || !commit.committedDate) continue;
      commits.push({
        projectId: mapping.projectId,
        projectName: mapping.activityLabel,
        repositoryUrl: url,
        messageHeadline: commit.messageHeadline,
        committedDate: commit.committedDate,
      });
    }
  });

  return { repositories, commits };
}

/**
 * Bounded GitHub fetch for configured repository slugs only.
 * Empty configured slug lists are valid and do not produce an error by themselves.
 */
export async function loadGitHubProfileActivity(): Promise<GitHubAdapterResult> {
  const config = getProfileConfig();
  const slugs = getConfiguredRepositorySlugs(config);
  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = config.githubUsername.trim();

  // No configured repos → nothing to fetch; not an error.
  if (slugs.length === 0) {
    return { source: "ok", repositories: [], commits: [] };
  }

  if (!token || !owner) {
    return { source: "fallback", repositories: [], commits: [] };
  }

  try {
    const query = buildReposQuery(slugs, config.commitsPerRepo);
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      next: { revalidate: 3600 },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Portfolio-Site",
      },
      body: JSON.stringify({
        query,
        variables: { owner },
      }),
    });

    if (!res.ok) {
      return { source: "error", repositories: [], commits: [] };
    }

    const json = (await res.json()) as {
      data?: Record<string, RepoNode | null | undefined>;
      errors?: { message: string }[];
    };

    // Partial GraphQL errors (missing repo) are acceptable — still parse present nodes.
    if (!json.data) {
      return { source: "error", repositories: [], commits: [] };
    }

    const parsed = parseAdapterPayload(json.data, slugs, config);
    return {
      source: "ok",
      repositories: parsed.repositories,
      commits: parsed.commits,
    };
  } catch {
    return { source: "error", repositories: [], commits: [] };
  }
}
