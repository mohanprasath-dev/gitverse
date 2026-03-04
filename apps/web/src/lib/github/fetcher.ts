import type { GitHubUser, RepositoryNode, WeeklyContribution } from '@gitverse/types';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

// ==========================================
// Retry + Exponential Backoff
// ==========================================

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on auth errors
      if (lastError.message.includes('401') || lastError.message.includes('403')) {
        throw lastError;
      }

      if (attempt < retries - 1) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.warn(`GitHub API attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error('All retries exhausted');
}

// ==========================================
// GraphQL Queries
// ==========================================

const USER_PROFILE_QUERY = `
query GetUserProfile($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    bio
    followers { totalCount }
    following { totalCount }
    repositories(first: 0, ownerAffiliations: OWNER) { totalCount }
    createdAt
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
  rateLimit {
    remaining
    resetAt
  }
}
`;

const USER_REPOS_QUERY = `
query GetUserRepos($login: String!, $first: Int!, $after: String) {
  user(login: $login) {
    repositories(
      first: $first
      after: $after
      ownerAffiliations: OWNER
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        description
        stargazerCount
        forkCount
        diskUsage
        updatedAt
        isArchived
        isFork
        primaryLanguage { name }
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name }
          }
          totalSize
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 0) { totalCount }
            }
          }
        }
        issues(states: OPEN) { totalCount }
        closedIssues: issues(states: CLOSED) { totalCount }
        pullRequests(states: OPEN) { totalCount }
        closedPRs: pullRequests(states: [CLOSED, MERGED]) { totalCount }
      }
    }
  }
  rateLimit {
    remaining
    resetAt
  }
}
`;

// ==========================================
// GitHub GraphQL Client
// ==========================================

interface RateLimitInfo {
  remaining: number;
  resetAt: string;
}

interface GraphQLResponse<T> {
  data: T & { rateLimit?: RateLimitInfo };
  errors?: Array<{ message: string }>;
}

async function githubGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<T & { rateLimit?: RateLimitInfo }> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  // Handle rate limiting from HTTP headers
  const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
  if (rateLimitRemaining && parseInt(rateLimitRemaining, 10) < 10) {
    const resetTime = response.headers.get('x-ratelimit-reset');
    const resetMs = resetTime ? parseInt(resetTime, 10) * 1000 - Date.now() : 60000;
    console.warn(`GitHub rate limit low (${rateLimitRemaining} remaining). Reset in ${Math.ceil(resetMs / 1000)}s`);

    if (parseInt(rateLimitRemaining, 10) < 3) {
      await sleep(Math.min(resetMs, 5000)); // Wait up to 5s if very close to limit
    }
  }

  if (response.status === 429) {
    throw new Error('GitHub API rate limit exceeded (429)');
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${text}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`);
  }

  return json.data;
}

// ==========================================
// Data Fetchers (with retry)
// ==========================================

interface UserProfileResponse {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    followers: { totalCount: number };
    following: { totalCount: number };
    repositories: { totalCount: number };
    createdAt: string;
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number;
            date: string;
          }>;
        }>;
      };
    };
  };
}

export async function fetchGitHubUser(login: string, token: string): Promise<GitHubUser> {
  return withRetry(async () => {
    const data = await githubGraphQL<UserProfileResponse>(
      USER_PROFILE_QUERY,
      { login },
      token,
    );

    const u = data.user;
    const cc = u.contributionsCollection;

    // Calculate contribution streak
    const allDays = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
    let streak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i]!.contributionCount > 0) {
        streak++;
      } else {
        break;
      }
    }

    return {
      login: u.login,
      name: u.name,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
      publicRepos: u.repositories.totalCount,
      totalCommitContributions: cc.totalCommitContributions,
      totalPRContributions: cc.totalPullRequestContributions,
      totalIssueContributions: cc.totalIssueContributions,
      contributionStreak: streak,
      joinedAt: u.createdAt,
    };
  });
}

interface ReposResponse {
  user: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      nodes: Array<{
        name: string;
        description: string | null;
        stargazerCount: number;
        forkCount: number;
        diskUsage: number;
        updatedAt: string;
        isArchived: boolean;
        isFork: boolean;
        primaryLanguage: { name: string } | null;
        languages: {
          edges: Array<{ size: number; node: { name: string } }>;
          totalSize: number;
        };
        defaultBranchRef: {
          target: { history: { totalCount: number } };
        } | null;
        issues: { totalCount: number };
        closedIssues: { totalCount: number };
        pullRequests: { totalCount: number };
        closedPRs: { totalCount: number };
      }>;
    };
  };
}

export async function fetchGitHubRepos(
  login: string,
  token: string,
  maxRepos = 50,
): Promise<RepositoryNode[]> {
  const allRepos: RepositoryNode[] = [];
  let after: string | null = null;

  while (allRepos.length < maxRepos) {
    const batchSize = Math.min(30, maxRepos - allRepos.length);

    const data = await withRetry(() =>
      githubGraphQL<ReposResponse>(
        USER_REPOS_QUERY,
        { login, first: batchSize, after },
        token,
      ),
    );

    const repos: ReposResponse['user']['repositories'] = data.user.repositories;

    for (const r of repos.nodes) {
      const totalLangSize = r.languages.totalSize || 1;
      const languages = r.languages.edges.map((e: { node: { name: string }; size: number }) => ({
        name: e.node.name,
        percentage: Math.round((e.size / totalLangSize) * 100 * 100) / 100,
      }));

      allRepos.push({
        name: r.name,
        description: r.description,
        stargazerCount: r.stargazerCount,
        forkCount: r.forkCount,
        diskUsage: r.diskUsage,
        updatedAt: r.updatedAt,
        isArchived: r.isArchived,
        isFork: r.isFork,
        primaryLanguage: r.primaryLanguage?.name ?? null,
        languages,
        recentCommits: r.defaultBranchRef?.target.history.totalCount ?? 0,
        openIssues: r.issues.totalCount,
        closedIssues: r.closedIssues.totalCount,
        openPRs: r.pullRequests.totalCount,
        closedPRs: r.closedPRs.totalCount,
      });
    }

    if (!repos.pageInfo.hasNextPage) break;
    after = repos.pageInfo.endCursor;
  }

  return allRepos;
}

// ==========================================
// Contribution Graph Data
// ==========================================

export async function fetchContributionWeeks(
  login: string,
  token: string,
): Promise<WeeklyContribution[]> {
  return withRetry(async () => {
    const data = await githubGraphQL<UserProfileResponse>(
      USER_PROFILE_QUERY,
      { login },
      token,
    );

    const weeks = data.user.contributionsCollection.contributionCalendar.weeks;

    return weeks.map((week) => {
      const totalCommits = week.contributionDays.reduce(
        (sum, day) => sum + day.contributionCount,
        0,
      );
      return {
        week: week.contributionDays[0]?.date ?? '',
        commits: totalCommits,
        additions: 0,
        deletions: 0,
      };
    });
  });
}
