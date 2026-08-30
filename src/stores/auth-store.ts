import { create } from 'zustand';

import type { AuthUser } from '@/types/auth.types';

type SessionStatus = 'restoring' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: SessionStatus;
  user: AuthUser | null;
  setRestoring: () => void;
  setAuthenticated: (user: AuthUser) => void;
  setUnauthenticated: () => void;
  updateUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'restoring',
  user: null,
  setRestoring: () => set({ status: 'restoring' }),
  setAuthenticated: (user) => set({ status: 'authenticated', user }),
  setUnauthenticated: () => set({ status: 'unauthenticated', user: null }),
  updateUser: (user) => set({ user }),
}));
