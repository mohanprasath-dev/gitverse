'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody } from '@gitverse/types';
import { useGalaxyStore } from '@/stores/galaxy-store';

// ==========================================
// Orbital Math (Kepler-inspired)
// ==========================================

/**
 * Compute orbital position using simplified Kepler motion.
 * Returns [x, y, z] position at a given time.
 */
function getOrbitalPosition(
  orbitRadius: number,
  time: number,
  speed: number,
  inclination: number = 0,
  eccentricity: number = 0.05,
): [number, number, number] {
  const angle = time * speed;

  // Slight eccentricity for more natural orbits
  const r = orbitRadius * (1 - eccentricity * Math.cos(angle));

  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  const y = Math.sin(angle * 0.5) * inclination;

  return [x, y, z];
}

// ==========================================
// Single Planet Component
// ==========================================

interface PlanetProps {
  planet: CelestialBody;
  index: number;
}

function Planet({ planet, index }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeScale = useGalaxyStore((s) => s.timeScale);
  const isPaused = useGalaxyStore((s) => s.isPaused);
  const hoverBody = useGalaxyStore((s) => s.hoverBody);
  const selectBody = useGalaxyStore((s) => s.selectBody);
  const hoveredBody = useGalaxyStore((s) => s.hoveredBody);

  const color = useMemo(() => new THREE.Color(planet.color), [planet.color]);
  const isHovered = hoveredBody?.id === planet.id;

  // Orbit parameters
  const orbitRadius = planet.orbitRadius ?? 10 + index * 4;
  const orbitSpeed = planet.orbitSpeed ?? 0.1 / Math.sqrt(orbitRadius / 8);
  const inclination = (index % 3) * 0.3; // Slight random inclination

  useFrame(({ clock }) => {
    if (groupRef.current && !isPaused) {
      const time = clock.getElapsedTime() * timeScale;
      const [x, y, z] = getOrbitalPosition(
        orbitRadius,
        time,
        orbitSpeed,
        inclination,
      );
      groupRef.current.position.set(x, y, z);
    }

    // Planet self-rotation
    if (meshRef.current && !isPaused) {
      meshRef.current.rotation.y += 0.005 * timeScale;
    }

    // Hover scale
    if (meshRef.current) {
      const targetScale = isHovered ? 1.1 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );
    }
  });

  return (
    <group ref={groupRef} position={planet.position}>
      {/* Planet mesh with wireframe overlay */}
      <Trail
        width={0.5}
        length={6}
        color={new THREE.Color(planet.color)}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          onPointerEnter={(e) => {
            e.stopPropagation();
            hoverBody(planet);
            document.body.style.cursor = 'pointer';
          }}
          onPointerLeave={() => {
            hoverBody(null);
            document.body.style.cursor = 'default';
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectBody(planet);
          }}
        >
          <sphereGeometry args={[planet.radius, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </Trail>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[planet.radius * 1.01, 16, 16]} />
        <meshBasicMaterial
          color={planet.color}
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Planet name */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, planet.radius + 0.6, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.03}
          outlineColor="#000000"
          maxWidth={5}
        >
          {planet.name}
        </Text>
      </Billboard>
    </group>
  );
}

// ==========================================
// SolarPlanets Component (All Planets)
// ==========================================

interface SolarPlanetsProps {
  planets: CelestialBody[];
}

export function SolarPlanets({ planets }: SolarPlanetsProps) {
  return (
    <group>
      {/* Orbit rings at origin (not parented to moving planet groups) */}
      {planets.map((planet, index) => {
        const orbitRadius = planet.orbitRadius ?? 10 + index * 4;
        return (
          <mesh key={`orbit-${planet.id}`} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 128]} />
            <meshBasicMaterial
              color={planet.color}
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      {planets.map((planet, index) => (
        <Planet key={planet.id} planet={planet} index={index} />
      ))}
    </group>
  );
}
