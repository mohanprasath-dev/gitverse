'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ==========================================
// Cosmic Dust — ambient floating particles
// Uses Points geometry for GPU-friendly rendering
// ==========================================

interface CosmicDustProps {
    count?: number;
    radius?: number;
}

export function CosmicDust({ count = 500, radius = 150 }: CosmicDustProps) {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, sizes] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const sz = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.cbrt(Math.random()) * radius;

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            sz[i] = 0.5 + Math.random() * 1.5;
        }

        return [pos, sz];
    }, [count, radius]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        return geo;
    }, [positions, sizes]);

    useFrame(({ clock }) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = clock.getElapsedTime() * 0.003;
            pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.001) * 0.1;
        }
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                color="#6366f1"
                size={0.3}
                sizeAttenuation
                transparent
                opacity={0.15}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
