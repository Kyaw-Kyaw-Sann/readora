import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse, PageResponse } from '@/types/api.types';
import type { Book } from '@/types/book.types';

export interface FavoriteStatus {
  favorite: boolean;
}

export async function addFavorite(bookId: number) {
  return getResponseData(await apiClient.post<ApiResponse<Book>>(`/api/favorites/${bookId}`));
}

export async function removeFavorite(bookId: number) {
  return getResponseData(await apiClient.delete<ApiResponse<null>>(`/api/favorites/${bookId}`));
}

export async function getFavoriteStatus(bookId: number) {
  return getResponseData(await apiClient.get<ApiResponse<FavoriteStatus>>(`/api/favorites/${bookId}/status`));
}

export async function getFavorites(page = 0, size = 20) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<Book>>>('/api/favorites', { params: { page, size } }));
}
