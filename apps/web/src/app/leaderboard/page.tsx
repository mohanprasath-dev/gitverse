'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, ArchetypeBadge, FadeIn } from '@gitverse/ui';
import Link from 'next/link';
import type { DeveloperArchetype } from '@gitverse/types';

// ==========================================
// Demo leaderboard data
// ==========================================

interface LeaderboardEntry {
    rank: number;
    login: string;
    name: string;
    avatarUrl: string;
    archetype: DeveloperArchetype;
    colorHex: string;
    totalCommits: number;
    totalStars: number;
    totalRepos: number;
    score: number;
}

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
    {
        rank: 1,
        login: 'stellar-forge',
        name: 'Stella Forge',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        archetype: 'The Architect',
        colorHex: '#3b82f6',
        totalCommits: 4820,
        totalStars: 2340,
        totalRepos: 67,
        score: 9850,
    },
    {
        rank: 2,
        login: 'quantum-dev',
        name: 'Quentin Dev',
        avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
        archetype: 'The Rapid Builder',
        colorHex: '#6366f1',
        totalCommits: 6210,
        totalStars: 1890,
        totalRepos: 112,
        score: 9420,
    },
    {
        rank: 3,
        login: 'nebula-ops',
        name: 'Nora Ops',
        avatarUrl: 'https://avatars.githubusercontent.com/u/3?v=4',
        archetype: 'The Polymath',
        colorHex: '#f59e0b',
        totalCommits: 3150,
        totalStars: 3100,
        totalRepos: 45,
        score: 9180,
    },
    {
        rank: 4,
        login: 'dark-matter',
        name: 'Darren Matter',
        avatarUrl: 'https://avatars.githubusercontent.com/u/4?v=4',
        archetype: 'The Precision Coder',
        colorHex: '#8b5cf6',
        totalCommits: 1240,
        totalStars: 4200,
        totalRepos: 18,
        score: 8760,
    },
    {
        rank: 5,
        login: 'cosmic-writer',
        name: 'Cosmo Writer',
        avatarUrl: 'https://avatars.githubusercontent.com/u/5?v=4',
        archetype: 'The Librarian',
        colorHex: '#10b981',
        totalCommits: 2780,
        totalStars: 1560,
        totalRepos: 89,
        score: 8340,
    },
    {
        rank: 6,
        login: 'warp-coder',
        name: 'Warp Coder',
        avatarUrl: 'https://avatars.githubusercontent.com/u/6?v=4',
        archetype: 'The Rapid Builder',
        colorHex: '#6366f1',
        totalCommits: 5430,
        totalStars: 920,
        totalRepos: 134,
        score: 7980,
    },
    {
        rank: 7,
        login: 'event-horizon',
        name: 'Eve Horizon',
        avatarUrl: 'https://avatars.githubusercontent.com/u/7?v=4',
        archetype: 'The Architect',
        colorHex: '#3b82f6',
        totalCommits: 2190,
        totalStars: 2780,
        totalRepos: 31,
        score: 7650,
    },
    {
        rank: 8,
        login: 'photon-dev',
        name: 'Phoebe Dev',
        avatarUrl: 'https://avatars.githubusercontent.com/u/8?v=4',
        archetype: 'The Polymath',
        colorHex: '#f59e0b',
        totalCommits: 3680,
        totalStars: 1240,
        totalRepos: 78,
        score: 7320,
    },
];

// ==========================================
// Leaderboard Page
// ==========================================

type SortField = 'score' | 'totalCommits' | 'totalStars' | 'totalRepos';

export default function LeaderboardPage() {
    const [sortBy, setSortBy] = useState<SortField>('score');

    const sorted = [...DEMO_LEADERBOARD].sort((a, b) => b[sortBy] - a[sortBy]);

    return (
        <main className="min-h-screen px-4 pt-24 pb-12">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <FadeIn>
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-4xl font-bold">
                            <span className="cosmic-text-gradient">Cosmic Leaderboard</span>
                        </h1>
                        <p className="text-sm text-white/50">
                            The brightest stars in the GitVerse — ranked by cosmic influence
                        </p>
                    </div>
                </FadeIn>

                {/* Sort tabs */}
                <FadeIn delay={0.1}>
                    <div className="mb-6 flex justify-center gap-2">
                        {(
                            [
                                { key: 'score', label: '🏆 Score' },
                                { key: 'totalCommits', label: '📝 Commits' },
                                { key: 'totalStars', label: '⭐ Stars' },
                                { key: 'totalRepos', label: '📦 Repos' },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSortBy(tab.key)}
                                className={`rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200 ${sortBy === tab.key
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                        : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60 hover:bg-white/10'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                {/* Leaderboard entries */}
                <div className="space-y-3">
                    {sorted.map((entry, i) => (
                        <FadeIn key={entry.login} delay={0.15 + i * 0.05}>
                            <GlassCard
                                className={`flex items-center gap-4 !p-4 transition-all duration-300 hover:border-indigo-500/20 ${i === 0 ? '!border-amber-500/30 !bg-amber-500/5' : ''
                                    }`}
                            >
                                {/* Rank */}
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                                    {i < 3 ? (
                                        <span className="text-2xl">
                                            {['🥇', '🥈', '🥉'][i]}
                                        </span>
                                    ) : (
                                        <span className="text-lg font-bold text-white/20">
                                            {i + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <img
                                    src={entry.avatarUrl}
                                    alt={entry.login}
                                    className="h-10 w-10 flex-shrink-0 rounded-full border border-white/10"
                                />

                                {/* User info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-white">
                                            {entry.name}
                                        </p>
                                        <ArchetypeBadge
                                            archetype={entry.archetype}
                                            colorHex={entry.colorHex}
                                        />
                                    </div>
                                    <p className="text-xs text-white/30">@{entry.login}</p>
                                </div>

                                {/* Stats */}
                                <div className="hidden gap-6 sm:flex">
                                    <StatPill
                                        label="Commits"
                                        value={entry.totalCommits.toLocaleString()}
                                        highlight={sortBy === 'totalCommits'}
                                    />
                                    <StatPill
                                        label="Stars"
                                        value={entry.totalStars.toLocaleString()}
                                        highlight={sortBy === 'totalStars'}
                                    />
                                    <StatPill
                                        label="Repos"
                                        value={entry.totalRepos.toLocaleString()}
                                        highlight={sortBy === 'totalRepos'}
                                    />
                                </div>

                                {/* Score */}
                                <div className="flex-shrink-0 text-right">
                                    <p
                                        className="text-lg font-bold font-mono"
                                        style={{
                                            color: sortBy === 'score' ? '#818cf8' : 'rgba(255,255,255,0.5)',
                                        }}
                                    >
                                        {entry.score.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-white/20">SCORE</p>
                                </div>
                            </GlassCard>
                        </FadeIn>
                    ))}
                </div>

                {/* Demo notice */}
                <FadeIn delay={0.8}>
                    <div className="mt-8 text-center">
                        <p className="text-xs text-white/20">
                            🌌 Demo data — <Link href="/auth/signin" className="text-indigo-400 underline hover:text-indigo-300">Sign in</Link> to see your ranking
                        </p>
                    </div>
                </FadeIn>
            </div>
        </main>
    );
}

function StatPill({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string;
    highlight: boolean;
}) {
    return (
        <div className="text-center">
            <p
                className={`text-sm font-semibold font-mono ${highlight ? 'text-indigo-300' : 'text-white/50'
                    }`}
            >
                {value}
            </p>
            <p className="text-[10px] text-white/20">{label}</p>
        </div>
    );
}
