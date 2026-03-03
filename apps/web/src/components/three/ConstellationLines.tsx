'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { CelestialBody } from '@gitverse/types';

// ==========================================
// Constellation Lines — connecting repos by shared language
// ==========================================

interface ConstellationLinesProps {
  lines: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
  planets: CelestialBody[];
}

export function ConstellationLines({ lines, planets }: ConstellationLinesProps) {
  const planetMap = useMemo(() => {
    const map = new Map<string, CelestialBody>();
    for (const p of planets) {
      map.set(p.id, p);
    }
    return map;
  }, [planets]);

  const lineSegments = useMemo(() => {
    return lines
      .map((line) => {
        const from = planetMap.get(line.from);
        const to = planetMap.get(line.to);
        if (!from || !to) return null;
        return {
          points: [from.position, to.position] as [
            [number, number, number],
            [number, number, number],
          ],
          strength: line.strength,
          color: from.color,
        };
      })
      .filter(Boolean) as Array<{
      points: [[number, number, number], [number, number, number]];
      strength: number;
      color: string;
    }>;
  }, [lines, planetMap]);

  return (
    <group>
      {lineSegments.map((segment, i) => (
        <Line
          key={`constellation-${i}`}
          points={segment.points}
          color={segment.color}
          lineWidth={1}
          transparent
          opacity={segment.strength * 0.3}
          dashed
          dashSize={0.5}
          gapSize={0.3}
        />
      ))}
    </group>
  );
}
