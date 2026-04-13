export type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
};

export type ContributionWeek = {
  contributionDays: ContributionDay[];
};

export type GitHubContributionsData = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

const GRAPHQL = `
query UserContributions($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
`;

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: ContributionWeek[];
        };
      };
    };
  };
  errors?: { message: string }[];
};

export function parseGithubUsernameFromUrl(githubUrl: string): string | null {
  try {
    const u = new URL(githubUrl);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetches contribution calendar. Requires GITHUB_TOKEN for reliable results.
 * Cached via Next.js fetch revalidation.
 */
export async function getGitHubContributions(
  username: string | null | undefined
): Promise<GitHubContributionsData | null> {
  const login = username?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!login || !token) return null;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    next: { revalidate: 3600 },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "Portfolio-Site",
    },
    body: JSON.stringify({ query: GRAPHQL, variables: { login } }),
  });

  if (!res.ok) return null;

  const json = (await res.json()) as GraphQLResponse;
  if (json.errors?.length) return null;

  const user = json.data?.user;
  if (!user) return null;

  const cal = user.contributionsCollection?.contributionCalendar;
  const weeks = cal?.weeks ?? [];
  const totalContributions = cal?.totalContributions ?? 0;

  return {
    totalContributions,
    weeks,
  };
}
