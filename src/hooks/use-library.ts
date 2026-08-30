import { useQuery } from '@tanstack/react-query';

import { getLibrarySummary } from '@/api/library.api';
import { queryKeys } from '@/api/query-keys';

export function useLibrarySummary(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.library, queryFn: getLibrarySummary });
}
