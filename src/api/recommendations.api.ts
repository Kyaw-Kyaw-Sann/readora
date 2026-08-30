import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse, PageResponse } from '@/types/api.types';
import type { Recommendation } from '@/types/recommendation.types';

export async function getRecommendations(page = 0, size = 20) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<Recommendation>>>('/api/recommendations', { params: { page, size } }));
}
