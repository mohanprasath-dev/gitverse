'use client';

import { useGalaxyStore } from '@/stores/galaxy-store';
import { ArchetypeBadge, GlassCard } from '@gitverse/ui';
import { motion } from 'framer-motion';

export function GalaxyHUD() {
  const galaxyConfig = useGalaxyStore((s) => s.galaxyConfig);
  const hoveredBody = useGalaxyStore((s) => s.hoveredBody);
  const timeScale = useGalaxyStore((s) => s.timeScale);
  const isPaused = useGalaxyStore((s) => s.isPaused);
  const setTimeScale = useGalaxyStore((s) => s.setTimeScale);
  const togglePause = useGalaxyStore((s) => s.togglePause);

  if (!galaxyConfig) return null;

  const { user, aiInsight } = galaxyConfig;

  return (
    <>
      {/* Top-left: User info panel */}
      <div className="fixed left-4 top-4 z-20 max-w-xs">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="space-y-3">
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.login}
                  className="h-10 w-10 rounded-full border border-white/20"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {user.name ?? user.login}
                </p>
                <p className="text-xs text-white/40">@{user.login}</p>
              </div>
            </div>

            {aiInsight && (
              <>
                <ArchetypeBadge
                  archetype={aiInsight.archetype}
                  colorHex={aiInsight.colorHex}
                />
                <p className="text-xs italic text-white/50">
                  {aiInsight.cosmicDescription}
                </p>

                {/* Skill Scores */}
                <div className="grid grid-cols-2 gap-2">
                  <SkillBar label="Velocity" value={aiInsight.skillScores.velocity} />
                  <SkillBar label="Depth" value={aiInsight.skillScores.depth} />
                  <SkillBar label="Maintenance" value={aiInsight.skillScores.maintenance} />
                  <SkillBar label="Diversity" value={aiInsight.skillScores.diversity} />
                </div>
              </>
            )}

            <div className="flex gap-2 text-xs text-white/30">
              <span>{user.publicRepos} repos</span>
              <span>·</span>
              <span>{user.totalCommitContributions} commits</span>
              <span>·</span>
              <span>{user.followers} followers</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Bottom-center: Time Controls */}
      <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="flex items-center gap-4 !p-3">
            {/* Play/Pause */}
            <button
              onClick={togglePause}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 transition-colors"
              aria-label={isPaused ? 'Play animation' : 'Pause animation'}
            >
              {isPaused ? '▶' : '⏸'}
            </button>

            {/* Time scale slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">0.1x</span>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={timeScale}
                onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-indigo-500"
                aria-label="Time scale"
              />
              <span className="text-[10px] text-white/30">5x</span>
            </div>

            <span className="text-xs font-mono text-white/50">{timeScale.toFixed(1)}x</span>
          </GlassCard>
        </motion.div>
      </div>

      {/* Top-right: Hover tooltip */}
      {hoveredBody && (
        <div className="fixed right-4 top-4 z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GlassCard className="max-w-xs space-y-1 !p-4">
              <p className="text-sm font-semibold text-white">{hoveredBody.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/30">
                {hoveredBody.type}
              </p>
              {Boolean(hoveredBody.metadata?.language) && (
                <p className="text-xs text-white/50">
                  Language: {String(hoveredBody.metadata?.language)}
                </p>
              )}
              {hoveredBody.metadata?.stars !== undefined && (
                <p className="text-xs text-white/50">
                  ⭐ {String(hoveredBody.metadata?.stars)} stars
                </p>
              )}
              {Boolean(hoveredBody.metadata?.description) && (
                <p className="text-xs text-white/40">
                  {String(hoveredBody.metadata?.description)}
                </p>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ==========================================
// Skill Bar Sub-component
// ==========================================

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between">
        <span className="text-[10px] text-white/40">{label}</span>
        <span className="text-[10px] font-mono text-white/50">{Math.round(value)}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
