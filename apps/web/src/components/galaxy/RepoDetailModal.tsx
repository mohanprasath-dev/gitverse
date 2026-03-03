'use client';

import { useGalaxyStore } from '@/stores/galaxy-store';
import { GlassCard, CosmicButton, PresenceWrapper } from '@gitverse/ui';
import { motion } from 'framer-motion';

export function RepoDetailModal() {
  const selectedBody = useGalaxyStore((s) => s.selectedBody);
  const showDetails = useGalaxyStore((s) => s.showDetails);
  const selectBody = useGalaxyStore((s) => s.selectBody);
  const setShowDetails = useGalaxyStore((s) => s.setShowDetails);

  if (!selectedBody || !showDetails) return null;

  const meta = (selectedBody.metadata ?? {}) as Record<string, string | number | boolean | null | undefined>;
  const isPlanet = selectedBody.type === 'planet';

  return (
    <PresenceWrapper isVisible={showDetails}>
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            selectBody(null);
            setShowDetails(false);
          }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative z-10 w-full max-w-lg"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <GlassCard className="space-y-4 !border-indigo-500/20">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedBody.name}</h2>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  {selectedBody.type === 'star' ? '⭐ Central Star' : '🪐 Repository Planet'}
                </p>
              </div>
              <button
                onClick={() => {
                  selectBody(null);
                  setShowDetails(false);
                }}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            {meta.description && (
              <p className="text-sm text-white/60">{String(meta.description)}</p>
            )}

            {/* Stats Grid */}
            {isPlanet && (
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Stars" value={String(meta.stars ?? 0)} icon="⭐" />
                <StatCard label="Forks" value={String(meta.forks ?? 0)} icon="🔄" />
                <StatCard label="Commits" value={String(meta.commits ?? 0)} icon="📝" />
                <StatCard label="Open Issues" value={String(meta.openIssues ?? 0)} icon="🔴" />
                <StatCard label="Open PRs" value={String(meta.openPRs ?? 0)} icon="🟢" />
                {meta.language && (
                  <StatCard label="Language" value={String(meta.language)} icon="💻" />
                )}
              </div>
            )}

            {/* Star-specific info */}
            {selectedBody.type === 'star' && meta.archetype && (
              <div className="space-y-2">
                <p className="text-sm text-white/60">
                  <span className="font-semibold text-indigo-400">Archetype:</span>{' '}
                  {String(meta.archetype)}
                </p>
                {meta.bio && (
                  <p className="text-sm italic text-white/40">{String(meta.bio)}</p>
                )}
              </div>
            )}

            {/* Actions */}
            {isPlanet && (
              <div className="flex gap-2 pt-2">
                <a
                  href={`https://github.com/${meta.login ?? ''}/${selectedBody.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CosmicButton variant="primary">View on GitHub</CosmicButton>
                </a>
                <CosmicButton
                  variant="ghost"
                  onClick={() => {
                    selectBody(null);
                    setShowDetails(false);
                  }}
                >
                  Close
                </CosmicButton>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </PresenceWrapper>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 text-center">
      <div className="mb-1 text-lg">{icon}</div>
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </div>
  );
}
