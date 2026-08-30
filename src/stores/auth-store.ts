import { create } from 'zustand';

import type { AuthUser } from '@/types/auth.types';

type SessionStatus = 'restoring' | 'authenticated' | 'unauthenticated';
export type SessionRoute = 'welcome' | 'verify-email' | 'interests' | 'home';

interface AuthState {
  route: SessionRoute;
  status: SessionStatus;
  user: AuthUser | null;
  setRestoring: () => void;
  setAuthenticated: (user: AuthUser, route?: SessionRoute) => void;
  setUnauthenticated: () => void;
  updateUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  route: 'welcome',
  status: 'restoring',
  user: null,
  setRestoring: () => set({ status: 'restoring' }),
  setAuthenticated: (user, route = 'home') => set({ route, status: 'authenticated', user }),
  setUnauthenticated: () => set({ route: 'welcome', status: 'unauthenticated', user: null }),
  updateUser: (user) => set({ user }),
}));
