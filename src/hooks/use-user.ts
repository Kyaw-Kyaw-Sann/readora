import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
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
    onSuccess: (user) => queryClient.setQueryData(queryKeys.user.current, user),
  });
}

export function useUpdateUserInterests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: number[]) => updateUserInterests(categoryIds),
    onSuccess: (interests) => {
      queryClient.setQueryData(queryKeys.user.interests, interests);
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all });
    },
  });
}
