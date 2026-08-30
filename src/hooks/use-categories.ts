import { useQuery } from '@tanstack/react-query';

import { getCategories } from '@/api/categories.api';
import { queryKeys } from '@/api/query-keys';

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: getCategories });
}
