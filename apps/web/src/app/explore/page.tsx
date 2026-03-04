'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GalaxyCanvas } from '@/components/three/GalaxyCanvas';
import { GalaxyHUD } from '@/components/galaxy/GalaxyHUD';
import { RepoDetailModal } from '@/components/galaxy/RepoDetailModal';
import { CosmicLoader, CosmicButton } from '@gitverse/ui';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { buildStarSystem } from '@/lib/github/mapper';
import type { GalaxyConfig, StarSystemConfig } from '@gitverse/types';

// Demo galaxy config for non-authenticated users
const DEMO_GALAXY: GalaxyConfig = {
  id: 'demo-galaxy',
  userId: 'demo-user',
  user: {
    login: 'cosmic-explorer',
    name: 'Cosmic Explorer',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    bio: 'Exploring the cosmos through code',
    followers: 256,
    following: 42,
    publicRepos: 24,
    totalCommitContributions: 1847,
    totalPRContributions: 134,
    totalIssueContributions: 67,
    contributionStreak: 45,
    joinedAt: '2019-03-15T00:00:00Z',
  },
  repositories: [
    {
      name: 'starship-engine',
      description: 'High-performance warp drive simulation engine',
      stargazerCount: 340,
      forkCount: 42,
      diskUsage: 85000,
      updatedAt: '2026-03-01T00:00:00Z',
      isArchived: false,
      isFork: false,
      primaryLanguage: 'Rust',
      languages: [
        { name: 'Rust', percentage: 88 },
        { name: 'C', percentage: 12 },
      ],
      recentCommits: 567,
      openIssues: 15,
      closedIssues: 120,
      openPRs: 4,
      closedPRs: 89,
    },
    {
      name: 'nebula-ui',
      description: 'React component library with cosmic aesthetics',
      stargazerCount: 220,
      forkCount: 35,
      diskUsage: 45000,
      updatedAt: '2026-02-28T00:00:00Z',
      isArchived: false,
      isFork: false,
      primaryLanguage: 'TypeScript',
      languages: [
        { name: 'TypeScript', percentage: 72 },
        { name: 'CSS', percentage: 20 },
        { name: 'JavaScript', percentage: 8 },
      ],
      recentCommits: 324,
      openIssues: 8,
      closedIssues: 65,
      openPRs: 2,
      closedPRs: 56,
    },
    {
      name: 'quantum-api',
      description: 'GraphQL API with quantum-inspired caching',
      stargazerCount: 180,
      forkCount: 22,
      diskUsage: 32000,
      updatedAt: '2026-02-25T00:00:00Z',
      isArchived: false,
      isFork: false,
      primaryLanguage: 'TypeScript',
      languages: [
        { name: 'TypeScript', percentage: 90 },
        { name: 'Shell', percentage: 10 },
      ],
      recentCommits: 245,
      openIssues: 5,
      closedIssues: 42,
      openPRs: 1,
      closedPRs: 38,
    },
    {
      name: 'dark-matter-ml',
      description: 'Machine learning models for dark matter detection',
      stargazerCount: 95,
      forkCount: 14,
      diskUsage: 120000,
      updatedAt: '2026-02-20T00:00:00Z',
      isArchived: false,
      isFork: false,
      primaryLanguage: 'Python',
      languages: [
        { name: 'Python', percentage: 85 },
        { name: 'Jupyter Notebook', percentage: 15 },
      ],
      recentCommits: 156,
      openIssues: 3,
      closedIssues: 28,
      openPRs: 0,
      closedPRs: 21,
    },
    {
      name: 'pulsar-db',
      description: 'Time-series database optimized for astronomical data',
      stargazerCount: 67,
      forkCount: 9,
      diskUsage: 55000,
      updatedAt: '2026-02-15T00:00:00Z',
      isArchived: false,
      isFork: false,
      primaryLanguage: 'Go',
      languages: [
        { name: 'Go', percentage: 95 },
        { name: 'Shell', percentage: 5 },
      ],
      recentCommits: 189,
      openIssues: 6,
      closedIssues: 34,
      openPRs: 2,
      closedPRs: 29,
    },
    {
      name: 'cosmic-docs',
      description: 'Documentation for the cosmic ecosystem',
      stargazerCount: 30,
      forkCount: 12,
      diskUsage: 8000,
      updatedAt: '2026-03-02T00:00:00Z',
      isArchived: false,
      isFork: false,
      primaryLanguage: 'HTML',
      languages: [
        { name: 'HTML', percentage: 55 },
        { name: 'CSS', percentage: 30 },
        { name: 'JavaScript', percentage: 15 },
      ],
      recentCommits: 78,
      openIssues: 2,
      closedIssues: 15,
      openPRs: 1,
      closedPRs: 10,
    },
  ],
  aiInsight: {
    archetype: 'The Polymath',
    reasoning:
      'Exceptional language diversity spanning Rust, TypeScript, Python, and Go. Strong systems programming foundation combined with full-stack web development capabilities.',
    colorHex: '#f59e0b',
    cosmicDescription:
      'An amber supergiant radiating across multiple spectral bands, its planetary system a kaleidoscope of Rust asteroids, TypeScript gas giants, and Python water worlds—a galaxy of infinite curiosity.',
    skillScores: {
      velocity: 82,
      depth: 75,
      maintenance: 71,
      diversity: 92,
    },
  },
  generatedAt: new Date().toISOString(),
};

export default function ExplorePage() {
  const [starSystem, setStarSystem] = useState<StarSystemConfig | null>(null);
  const { setGalaxyConfig } = useGalaxyStore();

  useEffect(() => {
    setGalaxyConfig(DEMO_GALAXY);
    const system = buildStarSystem(DEMO_GALAXY);
    setStarSystem(system);
  }, [setGalaxyConfig]);

  if (!starSystem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CosmicLoader size={64} />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Demo banner */}
      <div className="fixed left-1/2 top-4 z-30 -translate-x-1/2">
        <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-300 backdrop-blur-sm">
          🌌 Demo Galaxy — <a href="/auth/signin" className="underline hover:text-amber-200">Sign in</a> to see your own
        </div>
      </div>

      <GalaxyCanvas starSystem={starSystem} />

      {/* Navigation */}
      <div className="fixed left-4 bottom-4 z-20">
        <Link href="/">
          <CosmicButton variant="ghost">← Home</CosmicButton>
        </Link>
      </div>

      <GalaxyHUD />
      <RepoDetailModal />
    </div>
  );
}
