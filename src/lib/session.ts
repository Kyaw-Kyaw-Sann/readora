import { refreshAccessToken } from '@/api/client';
import { getCurrentUser, getUserInterests } from '@/api/users.api';
import { clearTokens, getStoredRefreshToken, saveTokens } from '@/lib/token-storage';
import { useAuthStore, type SessionRoute } from '@/stores/auth-store';
import type { AuthTokens, AuthUser } from '@/types/auth.types';

let restorePromise: Promise<SessionRoute> | null = null;

export function restoreSession() {
  if (!restorePromise) {
    restorePromise = restoreSessionState().finally(() => {
      restorePromise = null;
    });
  }

  return restorePromise;
}

export async function clearSession() {
  await clearTokens();
  useAuthStore.getState().setUnauthenticated();
}

export async function startAuthenticatedSession(tokens: AuthTokens, user: AuthUser) {
  await saveTokens(tokens);

  const sessionUser = user.emailVerified ? await getCurrentUser() : user;
  const route = await resolveUserRoute(sessionUser);

  return { route, user: sessionUser };
}

async function restoreSessionState(): Promise<SessionRoute> {
  const authStore = useAuthStore.getState();
  authStore.setRestoring();

  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) {
    authStore.setUnauthenticated();
    return 'welcome';
  }

  try {
    await refreshAccessToken();
    const user = await getCurrentUser();

    return resolveUserRoute(user);
  } catch {
    await clearSession();
    return 'welcome';
  }
}

async function resolveUserRoute(user: AuthUser): Promise<SessionRoute> {
  const authStore = useAuthStore.getState();

  if (!user.emailVerified) {
    authStore.setAuthenticated(user, 'verify-email');
    return 'verify-email';
  }

  const interests = await getUserInterests();
  const route: SessionRoute = interests.length === 0 ? 'interests' : 'home';
  authStore.setAuthenticated(user, route);
  return route;
}
