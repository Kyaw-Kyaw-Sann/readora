import * as SecureStore from 'expo-secure-store';

import type { AuthTokens } from '@/types/auth.types';

const ACCESS_TOKEN_KEY = 'readora.access-token';
const REFRESH_TOKEN_KEY = 'readora.refresh-token';

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export async function getStoredRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function restoreAccessToken() {
  accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return accessToken;
}

export async function saveTokens(tokens: AuthTokens) {
  accessToken = tokens.accessToken;

  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export async function replaceAccessToken(nextAccessToken: string) {
  accessToken = nextAccessToken;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, nextAccessToken);
}

export async function clearTokens() {
  accessToken = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
