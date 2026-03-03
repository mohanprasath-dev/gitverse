import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@gitverse/database';
import { fetchGitHubUser, fetchGitHubRepos } from '@/lib/github/fetcher';
import { buildGalaxyConfig } from '@/lib/github/mapper';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { error: 'Unauthorized', message: 'Sign in required', statusCode: 401 } },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Check for cached galaxy config (less than 1 hour old)
    const existingConfig = await prisma.galaxyConfig.findFirst({
      where: {
        userId,
        updatedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (existingConfig) {
      return NextResponse.json({
        success: true,
        data: existingConfig.configJson,
        cached: true,
      });
    }

    // Fetch fresh data from GitHub
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser?.accessToken || !dbUser.login) {
      return NextResponse.json(
        { success: false, error: { error: 'NoToken', message: 'GitHub token not found. Re-authenticate.', statusCode: 403 } },
        { status: 403 },
      );
    }

    const [githubUser, repos] = await Promise.all([
      fetchGitHubUser(dbUser.login, dbUser.accessToken),
      fetchGitHubRepos(dbUser.login, dbUser.accessToken),
    ]);

    const galaxyConfig = buildGalaxyConfig(userId, githubUser, repos);

    // Persist to database
    await prisma.galaxyConfig.create({
      data: {
        userId,
        configJson: JSON.parse(JSON.stringify(galaxyConfig)),
      },
    });

    return NextResponse.json({ success: true, data: galaxyConfig, cached: false });
  } catch (error) {
    console.error('Galaxy API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: { error: 'InternalError', message, statusCode: 500 } },
      { status: 500 },
    );
  }
}
