import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌌 Seeding GitVerse database...');

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { githubId: 999999 },
    update: {},
    create: {
      login: 'cosmic-dev',
      name: 'Cosmic Developer',
      email: 'cosmic@gitverse.dev',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      bio: 'Building the universe, one commit at a time.',
      githubId: 999999,
      followers: 42,
      following: 10,
      publicRepos: 15,
      joinedAt: new Date('2020-01-01'),
    },
  });

  console.log(`  ✅ Test user created: ${testUser.login}`);

  // Create galaxy config with test data
  const galaxyConfig = {
    id: 'test-galaxy-001',
    userId: testUser.id,
    user: {
      login: testUser.login,
      name: testUser.name,
      avatarUrl: testUser.avatarUrl,
      bio: testUser.bio,
      followers: 42,
      following: 10,
      publicRepos: 15,
      totalCommitContributions: 1247,
      totalPRContributions: 89,
      totalIssueContributions: 34,
      contributionStreak: 21,
      joinedAt: '2020-01-01T00:00:00Z',
    },
    repositories: [
      {
        name: 'nebula-core',
        description: 'Core engine for cosmic computations',
        stargazerCount: 120,
        forkCount: 18,
        diskUsage: 45000,
        updatedAt: '2026-02-15T00:00:00Z',
        isArchived: false,
        isFork: false,
        primaryLanguage: 'TypeScript',
        languages: [
          { name: 'TypeScript', percentage: 78.5 },
          { name: 'JavaScript', percentage: 15.2 },
          { name: 'CSS', percentage: 6.3 },
        ],
        recentCommits: 342,
        openIssues: 12,
        closedIssues: 45,
        openPRs: 3,
        closedPRs: 67,
      },
      {
        name: 'stellar-api',
        description: 'REST API for stellar data processing',
        stargazerCount: 85,
        forkCount: 12,
        diskUsage: 22000,
        updatedAt: '2026-02-10T00:00:00Z',
        isArchived: false,
        isFork: false,
        primaryLanguage: 'Python',
        languages: [
          { name: 'Python', percentage: 92.1 },
          { name: 'Shell', percentage: 7.9 },
        ],
        recentCommits: 156,
        openIssues: 5,
        closedIssues: 30,
        openPRs: 1,
        closedPRs: 42,
      },
      {
        name: 'galaxy-renderer',
        description: 'WebGL galaxy rendering engine',
        stargazerCount: 200,
        forkCount: 30,
        diskUsage: 78000,
        updatedAt: '2026-03-01T00:00:00Z',
        isArchived: false,
        isFork: false,
        primaryLanguage: 'TypeScript',
        languages: [
          { name: 'TypeScript', percentage: 65.0 },
          { name: 'GLSL', percentage: 25.0 },
          { name: 'HTML', percentage: 10.0 },
        ],
        recentCommits: 503,
        openIssues: 8,
        closedIssues: 92,
        openPRs: 5,
        closedPRs: 120,
      },
      {
        name: 'orbit-math',
        description: 'Orbital mechanics simulation library',
        stargazerCount: 55,
        forkCount: 8,
        diskUsage: 12000,
        updatedAt: '2026-01-20T00:00:00Z',
        isArchived: false,
        isFork: false,
        primaryLanguage: 'Rust',
        languages: [{ name: 'Rust', percentage: 100 }],
        recentCommits: 89,
        openIssues: 2,
        closedIssues: 15,
        openPRs: 0,
        closedPRs: 23,
      },
      {
        name: 'cosmic-docs',
        description: 'Documentation for the cosmic ecosystem',
        stargazerCount: 15,
        forkCount: 5,
        diskUsage: 3000,
        updatedAt: '2026-02-28T00:00:00Z',
        isArchived: false,
        isFork: false,
        primaryLanguage: 'HTML',
        languages: [
          { name: 'HTML', percentage: 60 },
          { name: 'CSS', percentage: 30 },
          { name: 'JavaScript', percentage: 10 },
        ],
        recentCommits: 45,
        openIssues: 1,
        closedIssues: 8,
        openPRs: 0,
        closedPRs: 12,
      },
    ],
    aiInsight: {
      archetype: 'The Rapid Builder',
      reasoning:
        'High commit velocity across multiple repositories with diverse tech stack usage. Strong PR throughput indicates collaborative rapid development.',
      colorHex: '#6366f1',
      cosmicDescription:
        'A blazing indigo hypergiant pulsing with relentless energy, its orbiting planets thick with TypeScript nebulae and Rust asteroid fields—a galaxy forged by velocity and precision.',
      skillScores: {
        velocity: 85,
        depth: 72,
        maintenance: 68,
        diversity: 78,
      },
    },
    generatedAt: new Date().toISOString(),
  };

  await prisma.galaxyConfig.upsert({
    where: { id: 'test-galaxy-seed' },
    update: {
      configJson: JSON.parse(JSON.stringify(galaxyConfig)),
    },
    create: {
      id: 'test-galaxy-seed',
      userId: testUser.id,
      configJson: JSON.parse(JSON.stringify(galaxyConfig)),
    },
  });

  console.log('  ✅ Galaxy config seeded');

  // Create AI insight record
  await prisma.aIInsight.upsert({
    where: { id: 'test-insight-001' },
    update: {},
    create: {
      id: 'test-insight-001',
      userId: testUser.id,
      archetype: 'The Rapid Builder',
      reasoning:
        'High commit velocity across multiple repositories with diverse tech stack usage.',
      colorHex: '#6366f1',
      cosmicDescription:
        'A blazing indigo hypergiant pulsing with relentless energy, its orbiting planets thick with TypeScript nebulae and Rust asteroid fields.',
      velocityScore: 85,
      depthScore: 72,
      maintenanceScore: 68,
      diversityScore: 78,
    },
  });

  console.log('  ✅ AI insight seeded');
  console.log('🌌 Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
