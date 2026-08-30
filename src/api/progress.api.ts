import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse, PageResponse } from '@/types/api.types';
import type { ListeningProgress, ReadingProgress, UpdateListeningProgressRequest, UpdateReadingProgressRequest } from '@/types/progress.types';

export async function getReadingProgress(bookId: number) {
  return getResponseData(await apiClient.get<ApiResponse<ReadingProgress>>(`/api/reading-progress/${bookId}`));
}

export async function updateReadingProgress(bookId: number, request: UpdateReadingProgressRequest) {
  return getResponseData(await apiClient.put<ApiResponse<ReadingProgress>>(`/api/reading-progress/${bookId}`, request));
}

export async function getContinueReading(page = 0, size = 10) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<ReadingProgress>>>('/api/reading-progress/continue', { params: { page, size } }));
}

export async function getRecentlyRead(page = 0, size = 10) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<ReadingProgress>>>('/api/reading-progress/recent', { params: { page, size } }));
}

export async function getListeningProgress(bookId: number) {
  return getResponseData(await apiClient.get<ApiResponse<ListeningProgress>>(`/api/listening-progress/${bookId}`));
}

export async function updateListeningProgress(bookId: number, request: UpdateListeningProgressRequest) {
  return getResponseData(await apiClient.put<ApiResponse<ListeningProgress>>(`/api/listening-progress/${bookId}`, request));
}

export async function getContinueListening(page = 0, size = 10) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<ListeningProgress>>>('/api/listening-progress/continue', { params: { page, size } }));
}

export async function getRecentlyListened(page = 0, size = 10) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<ListeningProgress>>>('/api/listening-progress/recent', { params: { page, size } }));
}
