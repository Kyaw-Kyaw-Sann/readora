import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addFavorite, getFavorites, getFavoriteStatus, removeFavorite } from '@/api/favorites.api';
import { queryKeys } from '@/api/query-keys';

export function useFavorites(page = 0, size = 20, enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.favorites.list(page, size), queryFn: () => getFavorites(page, size) });
}

export function useFavoriteStatus(bookId: number, enabled = true) {
  return useQuery({ enabled: enabled && Number.isFinite(bookId), queryKey: queryKeys.favorites.status(bookId), queryFn: () => getFavoriteStatus(bookId) });
}

export function useToggleFavorite(bookId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isFavorite: boolean) => (isFavorite ? removeFavorite(bookId) : addFavorite(bookId)),
    onSuccess: (_, wasFavorite) => {
      queryClient.setQueryData(queryKeys.favorites.status(bookId), { favorite: !wasFavorite });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.library });
    },
  });
}
