import { z } from 'zod';

// ==========================================
// Developer Archetypes
// ==========================================

export const DeveloperArchetypeEnum = z.enum([
  'The Architect',
  'The Rapid Builder',
  'The Precision Coder',
  'The Librarian',
  'The Polymath',
]);

export type DeveloperArchetype = z.infer<typeof DeveloperArchetypeEnum>;

// ==========================================
// GitHub Profile Data
// ==========================================

export const GitHubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string().url(),
  bio: z.string().nullable(),
  followers: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
  publicRepos: z.number().int().nonnegative(),
  totalCommitContributions: z.number().int().nonnegative(),
  totalPRContributions: z.number().int().nonnegative(),
  totalIssueContributions: z.number().int().nonnegative(),
  contributionStreak: z.number().int().nonnegative(),
  joinedAt: z.string(),
});

export type GitHubUser = z.infer<typeof GitHubUserSchema>;

// ==========================================
// Repository Data
// ==========================================

export const RepositoryNodeSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  stargazerCount: z.number().int().nonnegative(),
  forkCount: z.number().int().nonnegative(),
  diskUsage: z.number().int().nonnegative(),
  updatedAt: z.string(),
  isArchived: z.boolean(),
  isFork: z.boolean(),
  primaryLanguage: z.string().nullable(),
  languages: z.array(
    z.object({
      name: z.string(),
      percentage: z.number().min(0).max(100),
    }),
  ),
  recentCommits: z.number().int().nonnegative(),
  openIssues: z.number().int().nonnegative(),
  closedIssues: z.number().int().nonnegative(),
  openPRs: z.number().int().nonnegative(),
  closedPRs: z.number().int().nonnegative(),
});

export type RepositoryNode = z.infer<typeof RepositoryNodeSchema>;

// ==========================================
// AI Insight
// ==========================================

export const AIInsightSchema = z.object({
  archetype: DeveloperArchetypeEnum,
  reasoning: z.string(),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  cosmicDescription: z.string(),
  skillScores: z.object({
    velocity: z.number().min(0).max(100),
    depth: z.number().min(0).max(100),
    maintenance: z.number().min(0).max(100),
    diversity: z.number().min(0).max(100),
  }),
});

export type AIInsight = z.infer<typeof AIInsightSchema>;

// ==========================================
// Galaxy Configuration (Full Cosmic Entity)
// ==========================================

export const GalaxyConfigSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: GitHubUserSchema,
  repositories: z.array(RepositoryNodeSchema),
  aiInsight: AIInsightSchema.nullable(),
  generatedAt: z.string(),
});

export type GalaxyConfig = z.infer<typeof GalaxyConfigSchema>;

// ==========================================
// 3D Scene Types
// ==========================================

export interface CelestialBody {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'nebula';
  position: [number, number, number];
  radius: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  metadata?: Record<string, unknown>;
}

export interface StarSystemConfig {
  centralStar: CelestialBody;
  planets: CelestialBody[];
  asteroidBelt?: {
    innerRadius: number;
    outerRadius: number;
    count: number;
    density: number;
  };
  constellationLines?: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
}

// ==========================================
// API Response Types
// ==========================================

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ==========================================
// Contribution Graph
// ==========================================

export const WeeklyContributionSchema = z.object({
  week: z.string(),
  commits: z.number().int().nonnegative(),
  additions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
});

export type WeeklyContribution = z.infer<typeof WeeklyContributionSchema>;

export const ContributionGraphSchema = z.object({
  weeks: z.array(WeeklyContributionSchema),
  totalContributions: z.number().int().nonnegative(),
});

export type ContributionGraph = z.infer<typeof ContributionGraphSchema>;
