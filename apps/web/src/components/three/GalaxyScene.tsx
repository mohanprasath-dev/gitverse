'use client';

import { OrbitControls, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { StarSystem } from './StarSystem';
import { SolarPlanets } from './SolarPlanets';
import { AsteroidBelt } from './AsteroidBelt';
import { ConstellationLines } from './ConstellationLines';
import { useGalaxyStore } from '@/stores/galaxy-store';
import type { StarSystemConfig } from '@gitverse/types';

interface GalaxySceneProps {
  starSystem: StarSystemConfig;
}

export function GalaxyScene({ starSystem }: GalaxySceneProps) {
  const timeScale = useGalaxyStore((s) => s.timeScale);
  const isPaused = useGalaxyStore((s) => s.isPaused);
  const cameraTarget = useGalaxyStore((s) => s.cameraTarget);
  const groupRef = useRef<THREE.Group>(null);

  // Slow ambient rotation of the entire galaxy
  useFrame((_, delta) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += delta * 0.01 * timeScale;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#6366f1" />
      <pointLight
        position={[0, 0, 0]}
        intensity={3}
        color={starSystem.centralStar.emissive ?? '#6366f1'}
        distance={200}
        decay={2}
      />

      {/* Fog for depth */}
      <fogExp2 attach="fog" args={['#0a0a0f', 0.005]} />

      {/* Background stars */}
      <Stars
        radius={300}
        depth={100}
        count={5000}
        factor={4}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={500}
        target={new THREE.Vector3(...cameraTarget)}
        enablePan
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />

      {/* Galaxy Group */}
      <group ref={groupRef}>
        {/* Central Star (User) */}
        <StarSystem star={starSystem.centralStar} />

        {/* Planets (Repositories) */}
        <SolarPlanets planets={starSystem.planets} />

        {/* Asteroid Belt (Issues/PRs) */}
        {starSystem.asteroidBelt && (
          <AsteroidBelt config={starSystem.asteroidBelt} />
        )}

        {/* Constellation Lines (Language connections) */}
        {starSystem.constellationLines && (
          <ConstellationLines
            lines={starSystem.constellationLines}
            planets={starSystem.planets}
          />
        )}
      </group>
    </>
  );
}
