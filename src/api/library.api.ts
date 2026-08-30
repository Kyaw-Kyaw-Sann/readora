import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse } from '@/types/api.types';
import type { LibrarySummary } from '@/types/library.types';

export async function getLibrarySummary() {
  return getResponseData(await apiClient.get<ApiResponse<LibrarySummary>>('/api/library/summary'));
}
