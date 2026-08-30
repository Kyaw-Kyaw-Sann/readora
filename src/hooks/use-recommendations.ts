import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { getRecommendations } from '@/api/recommendations.api';

export function useRecommendations(page = 0, size = 20, enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.recommendations.list(page, size), queryFn: () => getRecommendations(page, size) });
}
