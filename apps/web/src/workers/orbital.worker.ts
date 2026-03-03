/**
 * Web Worker for calculation-heavy operations
 * Used to offload orbital math and scene generation from the main thread.
 */

interface WorkerMessage {
  type: 'compute-orbits' | 'generate-positions';
  payload: unknown;
}

interface OrbitParams {
  count: number;
  baseRadius: number;
  time: number;
}

interface PositionResult {
  positions: Float32Array;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'compute-orbits': {
      const params = payload as OrbitParams;
      const positions = computeOrbitalPositions(params);
      self.postMessage({ type: 'orbits-computed', payload: positions } satisfies {
        type: string;
        payload: PositionResult;
      });
      break;
    }

    case 'generate-positions': {
      const params = payload as { count: number; innerRadius: number; outerRadius: number };
      const positions = generateAsteroidPositions(params);
      self.postMessage({ type: 'positions-generated', payload: positions });
      break;
    }
  }
};

function computeOrbitalPositions(params: OrbitParams): PositionResult {
  const { count, baseRadius, time } = params;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const orbitRadius = baseRadius + i * 4;
    const speed = 0.1 / Math.sqrt(orbitRadius / 8);
    const angle = time * speed;
    const eccentricity = 0.05;
    const r = orbitRadius * (1 - eccentricity * Math.cos(angle));

    positions[i * 3] = r * Math.cos(angle);
    positions[i * 3 + 1] = Math.sin(angle * 0.5) * ((i % 3) * 0.3);
    positions[i * 3 + 2] = r * Math.sin(angle);
  }

  return { positions };
}

function generateAsteroidPositions(params: {
  count: number;
  innerRadius: number;
  outerRadius: number;
}): Float32Array {
  const positions = new Float32Array(params.count * 3);

  for (let i = 0; i < params.count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius =
      params.innerRadius + Math.random() * (params.outerRadius - params.innerRadius);
    const height = (Math.random() - 0.5) * 1.5;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  return positions;
}

export {};
