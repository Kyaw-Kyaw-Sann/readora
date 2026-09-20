import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createReview, deleteMyReview, findMyReview, getReviews, getReviewSummary, updateMyReview } from '@/api/reviews.api';
import { queryKeys } from '@/api/query-keys';
import type { ReviewRequest } from '@/types/review.types';

type ReviewSort = 'NEWEST' | 'OLDEST';

export function useReviews(bookId: number, page = 0, size = 10, sort: ReviewSort = 'NEWEST', enabled = true) {
  return useQuery({
    enabled: enabled && Number.isFinite(bookId),
    queryFn: () => getReviews(bookId, page, size, sort),
    queryKey: queryKeys.reviews.list(bookId, page, size, sort),
  });
}

export function useMyReview(bookId: number, userId: number, enabled = true) {
  return useQuery({
    enabled:enabled && bookId>0 && userId>0,
    queryKey:queryKeys.reviews.mine(bookId,userId),
    queryFn:({signal})=>findMyReview(bookId,userId,signal),
  });
}

type ReviewAction = {type:'create' | 'update';request:ReviewRequest} | {type:'delete'};

export function useReviewMutation(bookId: number, userId: number) {
  const client = useQueryClient();
  return useMutation({
    scope:{id:`review-${bookId}-${userId}`},retry:0,
    mutationFn:(action:ReviewAction)=>action.type==='delete' ? deleteMyReview(bookId)
      : action.type==='create' ? createReview(bookId,action.request) : updateMyReview(bookId,action.request),
    onSuccess:async review=>{
      // Cancel stale ownership lookup before writing the server's authoritative result.
      await client.cancelQueries({queryKey:queryKeys.reviews.mine(bookId,userId)});
      client.setQueryData(queryKeys.reviews.mine(bookId,userId),review);
      await Promise.all([
        client.invalidateQueries({queryKey:queryKeys.reviews.all(bookId)}),
        client.invalidateQueries({queryKey:queryKeys.books.detail(bookId)}),
      ]);
    },
    onError:()=>{
      // Another device may have created/deleted the review. Reconcile, not optimistic duplicates.
      void client.invalidateQueries({queryKey:queryKeys.reviews.mine(bookId,userId)});
    },
  });
}

export function useReviewSummary(bookId: number, enabled = true) {
  return useQuery({
    enabled: enabled && Number.isFinite(bookId),
    queryFn: () => getReviewSummary(bookId),
    queryKey: queryKeys.reviews.summary(bookId),
  });
}
