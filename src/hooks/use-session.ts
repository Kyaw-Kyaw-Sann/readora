import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';

import { logout } from '@/api/auth.api';
import { clearSession, restoreSession } from '@/lib/session';
import { getStoredRefreshToken } from '@/lib/token-storage';

export function useRestoreSession() {
  return useMutation({ mutationFn: restoreSession });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getStoredRefreshToken();

      if (refreshToken) {
        try {
          await logout(refreshToken);
        } catch {
          // Local token cleanup must still happen if the session is already invalid on the server.
        }
      }

      await clearSession();
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace('/welcome' as Href);
    },
  });
}
