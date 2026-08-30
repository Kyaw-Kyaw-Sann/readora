import { refreshAccessToken } from '@/api/client';
import { getCurrentUser, getUserInterests } from '@/api/users.api';
import { clearTokens, getStoredRefreshToken } from '@/lib/token-storage';
import { useAuthStore, type SessionRoute } from '@/stores/auth-store';

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

    if (!user.emailVerified) {
      authStore.setAuthenticated(user, 'verify-email');
      return 'verify-email';
    }

    const interests = await getUserInterests();
    const route: SessionRoute = interests.length === 0 ? 'interests' : 'home';
    authStore.setAuthenticated(user, route);
    return route;
  } catch {
    await clearSession();
    return 'welcome';
  }
}
