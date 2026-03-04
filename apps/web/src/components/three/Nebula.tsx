'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ==========================================
// Nebula — volumetric noise-driven cloud
// Represents organizations per the spec
// ==========================================

const nebulaVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Simple 3D noise (hash-based)
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
    );
  }
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    // Animated noise-based nebula
    vec3 pos = vPosition * 0.5 + vec3(uTime * 0.02);
    float n = fbm(pos);
    
    // Edge fade
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
    
    // Core brightness
    float core = smoothstep(0.3, 0.6, n) * rim;
    
    vec3 color = uColor * core * 2.0;
    float alpha = core * uOpacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

interface NebulaProps {
    position?: [number, number, number];
    color?: string;
    scale?: number;
    opacity?: number;
}

export function Nebula({
    position = [0, 0, -30],
    color = '#7c3aed',
    scale = 15,
    opacity = 0.15,
}: NebulaProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(
        () => ({
            uColor: { value: new THREE.Color(color) },
            uTime: { value: 0 },
            uOpacity: { value: opacity },
        }),
        [color, opacity],
    );

    useFrame(({ clock }) => {
        uniforms.uTime.value = clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0005;
            meshRef.current.rotation.z += 0.0003;
        }
    });

    return (
        <mesh ref={meshRef} position={position} scale={[scale, scale * 0.6, scale]}>
            <sphereGeometry args={[1, 32, 32]} />
            <shaderMaterial
                vertexShader={nebulaVertexShader}
                fragmentShader={nebulaFragmentShader}
                uniforms={uniforms}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
