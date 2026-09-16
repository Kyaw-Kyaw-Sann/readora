import { useQuery } from '@tanstack/react-query';

import { getReviews, getReviewSummary } from '@/api/reviews.api';
import { queryKeys } from '@/api/query-keys';

type ReviewSort = 'NEWEST' | 'OLDEST';

export function useReviews(bookId: number, page = 0, size = 10, sort: ReviewSort = 'NEWEST', enabled = true) {
  return useQuery({
    enabled: enabled && Number.isFinite(bookId),
    queryFn: () => getReviews(bookId, page, size, sort),
    queryKey: queryKeys.reviews.list(bookId, page, size, sort),
  });
}

export function useReviewSummary(bookId: number, enabled = true) {
  return useQuery({
    enabled: enabled && Number.isFinite(bookId),
    queryFn: () => getReviewSummary(bookId),
    queryKey: queryKeys.reviews.summary(bookId),
  });
}
