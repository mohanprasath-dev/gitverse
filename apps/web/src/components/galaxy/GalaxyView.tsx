'use client';

import { useEffect, useState } from 'react';
import { GalaxyCanvas } from '@/components/three/GalaxyCanvas';
import { GalaxyHUD } from '@/components/galaxy/GalaxyHUD';
import { RepoDetailModal } from '@/components/galaxy/RepoDetailModal';
import { CosmicLoader } from '@gitverse/ui';
import { useGalaxyStore } from '@/stores/galaxy-store';
import { buildStarSystem } from '@/lib/github/mapper';
import type { GalaxyConfig, StarSystemConfig } from '@gitverse/types';

interface GalaxyViewProps {
  userId: string;
}

export function GalaxyView({ userId }: GalaxyViewProps) {
  const [starSystem, setStarSystem] = useState<StarSystemConfig | null>(null);
  const { isLoading, error, setGalaxyConfig, setLoading, setError } = useGalaxyStore();

  useEffect(() => {
    async function loadGalaxy() {
      setLoading(true);
      try {
        const response = await fetch('/api/galaxy');
        const result = await response.json();

        if (!result.success) {
          setError(result.error?.message ?? 'Failed to load galaxy');
          return;
        }

        const config = result.data as GalaxyConfig;
        setGalaxyConfig(config);

        // Build 3D scene configuration
        const system = buildStarSystem(config);
        setStarSystem(system);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load galaxy');
      } finally {
        setLoading(false);
      }
    }

    loadGalaxy();
  }, [userId, setGalaxyConfig, setLoading, setError]);

  if (isLoading || !starSystem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <CosmicLoader size={64} />
        <p className="text-sm text-white/50">Generating your galaxy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-400">⚠️ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-indigo-400 underline hover:text-indigo-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 3D Canvas */}
      <GalaxyCanvas starSystem={starSystem} />

      {/* HUD Overlay */}
      <GalaxyHUD />

      {/* Repository Detail Modal */}
      <RepoDetailModal />
    </div>
  );
}
