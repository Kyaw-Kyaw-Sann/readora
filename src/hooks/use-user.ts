import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import { getCurrentUser, getUserInterests, updateCurrentUser, updateUserInterests, type UpdateProfileRequest } from '@/api/users.api';

export function useCurrentUser(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.user.current, queryFn: getCurrentUser });
}

export function useUserInterests(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.user.interests, queryFn: getUserInterests });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) => updateCurrentUser(request),
    onSuccess: async (user) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.current });
      const auth = useAuthStore.getState();
      if (auth.status !== 'authenticated' || auth.user?.id !== user.id) return;
      queryClient.setQueryData(queryKeys.user.current, user);
      auth.updateUser(user);
    },
  });
}

export function useUpdateUserInterests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: number[]) => updateUserInterests(categoryIds),
    onMutate: () => useAuthStore.getState().user?.id,
    onSuccess: async (interests, _variables, userId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.interests });
      const auth = useAuthStore.getState();
      if (auth.status !== 'authenticated' || auth.user?.id !== userId) return;
      queryClient.setQueryData(queryKeys.user.interests, interests);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.library }),
      ]);
    },
  });
}
