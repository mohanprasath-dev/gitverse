'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { CosmicLoader } from '@gitverse/ui';
import { GalaxyScene } from './GalaxyScene';
import type { StarSystemConfig } from '@gitverse/types';

interface GalaxyCanvasProps {
  starSystem: StarSystemConfig;
}

export function GalaxyCanvas({ starSystem }: GalaxyCanvasProps) {
  return (
    <div className="fixed inset-0 z-0" aria-label="3D Galaxy Visualization">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-[#0a0a0f]">
            <CosmicLoader size={64} />
          </div>
        }
      >
        <Canvas
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
          camera={{
            fov: 60,
            near: 0.1,
            far: 5000,
            position: [0, 15, 40],
          }}
          dpr={[1, 2]}
          style={{ background: '#0a0a0f' }}
        >
          <GalaxyScene starSystem={starSystem} />
        </Canvas>
      </Suspense>
    </div>
  );
}
