'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

// ==========================================
// Planet Rings — rendered around high-star repos
// ==========================================

interface PlanetRingsProps {
    innerRadius: number;
    outerRadius: number;
    color: string;
    opacity?: number;
}

export function PlanetRings({
    innerRadius,
    outerRadius,
    color,
    opacity = 0.25,
}: PlanetRingsProps) {
    const ringColor = useMemo(() => new THREE.Color(color), [color]);

    return (
        <group rotation={[Math.PI * 0.4, 0, Math.PI * 0.1]}>
            {/* Main ring */}
            <mesh>
                <ringGeometry args={[innerRadius, outerRadius, 64]} />
                <meshBasicMaterial
                    color={ringColor}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Inner glow ring */}
            <mesh>
                <ringGeometry args={[innerRadius * 0.95, innerRadius, 64]} />
                <meshBasicMaterial
                    color={ringColor}
                    transparent
                    opacity={opacity * 0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}
