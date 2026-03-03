import { create } from 'zustand';
import type { GalaxyConfig, CelestialBody } from '@gitverse/types';

// ==========================================
// Galaxy Store — Scene State
// ==========================================

interface GalaxyState {
  // Galaxy data
  galaxyConfig: GalaxyConfig | null;
  isLoading: boolean;
  error: string | null;

  // Scene interaction
  selectedBody: CelestialBody | null;
  hoveredBody: CelestialBody | null;
  cameraTarget: [number, number, number];
  showDetails: boolean;

  // Time controls
  timeScale: number;
  isPaused: boolean;

  // Actions
  setGalaxyConfig: (config: GalaxyConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectBody: (body: CelestialBody | null) => void;
  hoverBody: (body: CelestialBody | null) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  setShowDetails: (show: boolean) => void;
  setTimeScale: (scale: number) => void;
  togglePause: () => void;
  reset: () => void;
}

const initialState = {
  galaxyConfig: null,
  isLoading: false,
  error: null,
  selectedBody: null,
  hoveredBody: null,
  cameraTarget: [0, 0, 0] as [number, number, number],
  showDetails: false,
  timeScale: 1,
  isPaused: false,
};

export const useGalaxyStore = create<GalaxyState>((set) => ({
  ...initialState,

  setGalaxyConfig: (config) => set({ galaxyConfig: config, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  selectBody: (body) =>
    set({
      selectedBody: body,
      showDetails: body !== null,
      cameraTarget: body?.position ?? [0, 0, 0],
    }),
  hoverBody: (body) => set({ hoveredBody: body }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setShowDetails: (show) => set({ showDetails: show }),
  setTimeScale: (scale) => set({ timeScale: Math.max(0, Math.min(10, scale)) }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  reset: () => set(initialState),
}));

// ==========================================
// User Session Store
// ==========================================

interface UserState {
  userId: string | null;
  username: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;

  setUser: (user: { id: string; username: string; avatarUrl: string }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  username: null,
  avatarUrl: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isAuthenticated: true,
    }),
  clearUser: () =>
    set({
      userId: null,
      username: null,
      avatarUrl: null,
      isAuthenticated: false,
    }),
}));
