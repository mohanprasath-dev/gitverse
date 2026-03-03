import type {
  GitHubUser,
  RepositoryNode,
  GalaxyConfig,
  StarSystemConfig,
  CelestialBody,
} from '@gitverse/types';


// ==========================================
// Map GitHub data to GalaxyConfig
// ==========================================

export function buildGalaxyConfig(
  userId: string,
  user: GitHubUser,
  repositories: RepositoryNode[],
): GalaxyConfig {
  return {
    id: crypto.randomUUID(),
    userId,
    user,
    repositories,
    aiInsight: null, // Will be populated by AI service
    generatedAt: new Date().toISOString(),
  };
}

// ==========================================
// Map GalaxyConfig to 3D Scene Config
// ==========================================

export function buildStarSystem(config: GalaxyConfig): StarSystemConfig {
  const { user, repositories, aiInsight } = config;

  // Central star brightness based on activity
  const activityScore =
    (user.totalCommitContributions + user.totalPRContributions * 2 + user.contributionStreak) / 100;
  const starBrightness = Math.min(2.5, 0.5 + activityScore);
  const starColor = aiInsight?.colorHex ?? '#6366f1';

  const centralStar: CelestialBody = {
    id: `star-${user.login}`,
    name: user.name ?? user.login,
    type: 'star',
    position: [0, 0, 0],
    radius: 2 + Math.min(3, activityScore * 0.5),
    color: starColor,
    emissive: starColor,
    emissiveIntensity: starBrightness,
    metadata: {
      login: user.login,
      archetype: aiInsight?.archetype,
      bio: user.bio,
    },
  };

  // Planets from repositories
  const sortedRepos = [...repositories]
    .filter((r) => !r.isArchived && !r.isFork)
    .sort((a, b) => b.stargazerCount + b.recentCommits - (a.stargazerCount + a.recentCommits));

  const planets: CelestialBody[] = sortedRepos.slice(0, 20).map((repo, index) => {
    const orbitRadius = 8 + index * 4;
    const angle = (index / Math.min(sortedRepos.length, 20)) * Math.PI * 2;

    // Planet size based on disk usage (log scale)
    const size = 0.3 + Math.log10(Math.max(1, repo.diskUsage)) * 0.25;

    // Color based on primary language
    const langColor = getLanguageColor(repo.primaryLanguage);

    // Orbit speed inversely proportional to orbit radius (Kepler-inspired)
    const orbitSpeed = 0.1 / Math.sqrt(orbitRadius / 8);

    return {
      id: `planet-${repo.name}`,
      name: repo.name,
      type: 'planet' as const,
      position: [
        Math.cos(angle) * orbitRadius,
        (Math.random() - 0.5) * 2, // Slight vertical offset
        Math.sin(angle) * orbitRadius,
      ] as [number, number, number],
      radius: size,
      color: langColor,
      orbitRadius,
      orbitSpeed,
      metadata: {
        login: user.login,
        description: repo.description,
        stars: repo.stargazerCount,
        forks: repo.forkCount,
        language: repo.primaryLanguage,
        commits: repo.recentCommits,
        openIssues: repo.openIssues,
        openPRs: repo.openPRs,
      },
    };
  });

  // Asteroid belt from issues/PRs density
  const totalIssues = repositories.reduce((sum, r) => sum + r.openIssues + r.closedIssues, 0);
  const totalPRs = repositories.reduce((sum, r) => sum + r.openPRs + r.closedPRs, 0);
  const issuesDensity = Math.min(200, totalIssues + totalPRs);

  // Constellation lines — connect repos that share primary languages
  const constellationLines: Array<{ from: string; to: string; strength: number }> = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = sortedRepos[i];
      const b = sortedRepos[j];
      if (a && b && a.primaryLanguage && a.primaryLanguage === b.primaryLanguage) {
        constellationLines.push({
          from: planets[i]!.id,
          to: planets[j]!.id,
          strength: 0.5,
        });
      }
    }
  }

  return {
    centralStar,
    planets,
    asteroidBelt: issuesDensity > 10
      ? {
          innerRadius: 5,
          outerRadius: 7,
          count: issuesDensity,
          density: Math.min(1, issuesDensity / 200),
        }
      : undefined,
    constellationLines: constellationLines.length > 0 ? constellationLines : undefined,
  };
}

// ==========================================
// Language → Color Mapping
// ==========================================

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Zig: '#ec915c',
};

function getLanguageColor(language: string | null): string {
  if (!language) return '#8b8b8b';
  return LANGUAGE_COLORS[language] ?? '#8b8b8b';
}
