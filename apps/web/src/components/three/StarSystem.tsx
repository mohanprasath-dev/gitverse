'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody } from '@gitverse/types';
import { useGalaxyStore } from '@/stores/galaxy-store';

// ==========================================
// Star Glow Shader
// ==========================================

const starVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Core glow
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    
    // Pulsating effect
    float pulse = 0.9 + 0.1 * sin(uTime * 2.0);
    
    // Rim lighting
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    
    vec3 color = uColor * (intensity * uIntensity * pulse + rim * 0.5);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ==========================================
// Star Atmosphere (Outer Glow)
// ==========================================

const atmosphereVertexShader = `
  varying vec3 vNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  
  varying vec3 vNormal;
  
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    vec3 atmosphere = uColor * intensity * uIntensity;
    gl_FragColor = vec4(atmosphere, intensity * 0.6);
  }
`;

// ==========================================
// StarSystem Component
// ==========================================

interface StarSystemProps {
  star: CelestialBody;
}

export function StarSystem({ star }: StarSystemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const hoverBody = useGalaxyStore((s) => s.hoverBody);
  const selectBody = useGalaxyStore((s) => s.selectBody);
  const hoveredBody = useGalaxyStore((s) => s.hoveredBody);

  const color = useMemo(() => new THREE.Color(star.color), [star.color]);
  const emissiveColor = useMemo(
    () => new THREE.Color(star.emissive ?? star.color),
    [star.emissive, star.color],
  );

  const starUniforms = useMemo(
    () => ({
      uColor: { value: emissiveColor },
      uIntensity: { value: star.emissiveIntensity ?? 1.5 },
      uTime: { value: 0 },
    }),
    [emissiveColor, star.emissiveIntensity],
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: emissiveColor },
      uIntensity: { value: (star.emissiveIntensity ?? 1.5) * 0.6 },
    }),
    [emissiveColor, star.emissiveIntensity],
  );

  const isHovered = hoveredBody?.id === star.id;

  useFrame(({ clock }) => {
    if (starUniforms.uTime) {
      starUniforms.uTime.value = clock.getElapsedTime();
    }

    // Scale on hover
    if (meshRef.current) {
      const targetScale = isHovered ? 1.1 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );
    }
  });

  return (
    <group position={star.position}>
      {/* Core star mesh */}
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          e.stopPropagation();
          hoverBody(star);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          hoverBody(null);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectBody(star);
        }}
      >
        <sphereGeometry args={[star.radius, 64, 64]} />
        <shaderMaterial
          vertexShader={starVertexShader}
          fragmentShader={starFragmentShader}
          uniforms={starUniforms}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={glowRef} scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[star.radius, 32, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosphereUniforms}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Star name label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, star.radius + 1.5, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {star.name}
        </Text>
      </Billboard>
    </group>
  );
}
