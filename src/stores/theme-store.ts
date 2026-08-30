import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'readora.theme';

interface ThemeState {
  theme: ThemeMode;
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  setHydrated: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  hydrated: false,
  setTheme: (theme) => set({ theme }),
  setHydrated: () => set({ hydrated: true }),
}));

export async function hydrateTheme() {
  const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
  const theme = savedTheme === 'dark' ? 'dark' : 'light';

  useThemeStore.setState({ theme, hydrated: true });
}

export async function persistTheme(theme: ThemeMode) {
  useThemeStore.getState().setTheme(theme);
  await SecureStore.setItemAsync(THEME_KEY, theme);
}
