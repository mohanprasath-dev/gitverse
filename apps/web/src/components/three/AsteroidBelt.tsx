'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGalaxyStore } from '@/stores/galaxy-store';

// ==========================================
// Asteroid Belt — InstancedMesh of many small objects
// ==========================================

interface AsteroidBeltProps {
  config: {
    innerRadius: number;
    outerRadius: number;
    count: number;
    density: number;
  };
}

export function AsteroidBelt({ config }: AsteroidBeltProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeScale = useGalaxyStore((s) => s.timeScale);
  const isPaused = useGalaxyStore((s) => s.isPaused);

  // Pre-compute asteroid transforms
  const asteroidData = useMemo(() => {
    const data: Array<{
      angle: number;
      radius: number;
      height: number;
      speed: number;
      scale: number;
    }> = [];

    for (let i = 0; i < config.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius =
        config.innerRadius +
        Math.random() * (config.outerRadius - config.innerRadius);
      const height = (Math.random() - 0.5) * 1.5;
      const speed = 0.02 + Math.random() * 0.03;
      const scale = 0.02 + Math.random() * 0.08;

      data.push({ angle, radius, height, speed, scale });
    }

    return data;
  }, [config]);

  // Initialize instance matrices
  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();

    asteroidData.forEach((asteroid, i) => {
      const x = Math.cos(asteroid.angle) * asteroid.radius;
      const z = Math.sin(asteroid.angle) * asteroid.radius;

      dummy.position.set(x, asteroid.height, z);
      dummy.scale.setScalar(asteroid.scale);
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [asteroidData]);

  // Animate asteroid orbit
  useFrame(({ clock }) => {
    if (!meshRef.current || isPaused) return;

    const time = clock.getElapsedTime() * timeScale;
    const dummy = new THREE.Object3D();

    asteroidData.forEach((asteroid, i) => {
      const currentAngle = asteroid.angle + time * asteroid.speed;
      const x = Math.cos(currentAngle) * asteroid.radius;
      const z = Math.sin(currentAngle) * asteroid.radius;

      dummy.position.set(x, asteroid.height, z);
      dummy.scale.setScalar(asteroid.scale);
      dummy.rotation.set(
        currentAngle * 0.5,
        currentAngle * 0.3,
        currentAngle * 0.7,
      );
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, config.count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#8b8b8b"
        emissive="#4a4a4a"
        emissiveIntensity={0.2}
        roughness={0.9}
        metalness={0.1}
      />
    </instancedMesh>
  );
}
