'use server';

import type { AIInsight, GalaxyConfig } from '@gitverse/types';
import { AIInsightSchema } from '@gitverse/types';
import { prisma } from '@gitverse/database';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';

/**
 * Call the Python AI service to analyze a galaxy and store the result.
 */
export async function analyzeGalaxy(galaxyConfig: GalaxyConfig): Promise<AIInsight | null> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze-galaxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: galaxyConfig.user,
        repositories: galaxyConfig.repositories,
      }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      console.error(`AI service error: ${response.status} ${response.statusText}`);
      return null;
    }

    const raw = await response.json();

    // Runtime validate with Zod
    const parsed = AIInsightSchema.safeParse({
      archetype: raw.archetype,
      reasoning: raw.reasoning,
      colorHex: raw.colorHex ?? raw.color_hex,
      cosmicDescription: raw.cosmicDescription ?? raw.cosmic_description,
      skillScores: raw.skillScores ?? raw.skill_scores,
    });

    if (!parsed.success) {
      console.error('AI response validation failed:', parsed.error.format());
      return null;
    }

    const insight = parsed.data;

    // Store in database
    await prisma.aIInsight.create({
      data: {
        userId: galaxyConfig.userId,
        archetype: insight.archetype,
        reasoning: insight.reasoning,
        colorHex: insight.colorHex,
        cosmicDescription: insight.cosmicDescription,
        velocityScore: insight.skillScores.velocity,
        depthScore: insight.skillScores.depth,
        maintenanceScore: insight.skillScores.maintenance,
        diversityScore: insight.skillScores.diversity,
      },
    });

    return insight;
  } catch (error) {
    console.error('Failed to analyze galaxy:', error);
    return null;
  }
}

/**
 * Fetch the latest AI insight for a user from the database.
 */
export async function getLatestInsight(userId: string): Promise<AIInsight | null> {
  try {
    const record = await prisma.aIInsight.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return null;

    return {
      archetype: record.archetype as AIInsight['archetype'],
      reasoning: record.reasoning,
      colorHex: record.colorHex,
      cosmicDescription: record.cosmicDescription,
      skillScores: {
        velocity: record.velocityScore,
        depth: record.depthScore,
        maintenance: record.maintenanceScore,
        diversity: record.diversityScore,
      },
    };
  } catch (error) {
    console.error('Failed to fetch AI insight:', error);
    return null;
  }
}
