import { describe, it, expect } from 'vitest';
import { buildGalaxyConfig, buildStarSystem } from '@/lib/github/mapper';
import type { GitHubUser, RepositoryNode } from '@gitverse/types';

const mockUser: GitHubUser = {
  login: 'test-user',
  name: 'Test User',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1',
  bio: 'Test bio',
  followers: 10,
  following: 5,
  publicRepos: 3,
  totalCommitContributions: 500,
  totalPRContributions: 30,
  totalIssueContributions: 15,
  contributionStreak: 10,
  joinedAt: '2020-01-01T00:00:00Z',
};

const mockRepos: RepositoryNode[] = [
  {
    name: 'repo-a',
    description: 'First repo',
    stargazerCount: 50,
    forkCount: 10,
    diskUsage: 30000,
    updatedAt: '2026-01-01T00:00:00Z',
    isArchived: false,
    isFork: false,
    primaryLanguage: 'TypeScript',
    languages: [{ name: 'TypeScript', percentage: 100 }],
    recentCommits: 200,
    openIssues: 5,
    closedIssues: 20,
    openPRs: 2,
    closedPRs: 15,
  },
  {
    name: 'repo-b',
    description: 'Second repo',
    stargazerCount: 20,
    forkCount: 3,
    diskUsage: 10000,
    updatedAt: '2026-02-01T00:00:00Z',
    isArchived: false,
    isFork: false,
    primaryLanguage: 'Python',
    languages: [{ name: 'Python', percentage: 100 }],
    recentCommits: 80,
    openIssues: 2,
    closedIssues: 10,
    openPRs: 0,
    closedPRs: 8,
  },
];

describe('buildGalaxyConfig', () => {
  it('should create a valid galaxy config from user and repos', () => {
    const config = buildGalaxyConfig('user-123', mockUser, mockRepos);

    expect(config.userId).toBe('user-123');
    expect(config.user.login).toBe('test-user');
    expect(config.repositories).toHaveLength(2);
    expect(config.aiInsight).toBeNull();
    expect(config.generatedAt).toBeDefined();
    expect(config.id).toBeDefined();
  });
});

describe('buildStarSystem', () => {
  it('should create a star system with central star and planets', () => {
    const config = buildGalaxyConfig('user-123', mockUser, mockRepos);
    const system = buildStarSystem(config);

    expect(system.centralStar).toBeDefined();
    expect(system.centralStar.type).toBe('star');
    expect(system.centralStar.name).toBe('Test User');
    expect(system.centralStar.position).toEqual([0, 0, 0]);

    expect(system.planets).toHaveLength(2);
    expect(system.planets[0]!.name).toBe('repo-a');
    expect(system.planets[0]!.type).toBe('planet');
    expect(system.planets[1]!.name).toBe('repo-b');
  });

  it('should generate constellation lines for repos with same language', () => {
    const sameLanguageRepos: RepositoryNode[] = [
      { ...mockRepos[0]!, primaryLanguage: 'TypeScript' },
      { ...mockRepos[1]!, primaryLanguage: 'TypeScript', name: 'repo-c' },
    ];

    const config = buildGalaxyConfig('user-123', mockUser, sameLanguageRepos);
    const system = buildStarSystem(config);

    expect(system.constellationLines).toBeDefined();
    expect(system.constellationLines!.length).toBeGreaterThan(0);
  });

  it('should create asteroid belt when sufficient issues exist', () => {
    const config = buildGalaxyConfig('user-123', mockUser, mockRepos);
    const system = buildStarSystem(config);

    // Total issues: 5+20+2+10 = 37, total PRs: 2+15+0+8 = 25 => 62 > 10
    expect(system.asteroidBelt).toBeDefined();
    expect(system.asteroidBelt!.count).toBeGreaterThan(10);
  });

  it('should calculate planet size with log scale', () => {
    const config = buildGalaxyConfig('user-123', mockUser, mockRepos);
    const system = buildStarSystem(config);

    // repo-a has diskUsage 30000, repo-b has 10000
    // repo-a planet should be larger
    expect(system.planets[0]!.radius).toBeGreaterThan(system.planets[1]!.radius);
  });
});
