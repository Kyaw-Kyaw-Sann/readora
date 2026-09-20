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
      try {
        const refreshToken = await getStoredRefreshToken();
        if (refreshToken) await logout(refreshToken);
      } catch {
        // Server revocation is best effort; secure local cleanup must still run.
      } finally {
        await queryClient.cancelQueries();
        try {
          await clearSession();
        } finally {
          queryClient.clear();
        }
      }
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace('/welcome' as Href);
    },
  });
}
