import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse, PageResponse } from '@/types/api.types';
import type { Review, ReviewRequest, ReviewSummary } from '@/types/review.types';

export async function getReviews(bookId: number, page = 0, size = 10, sort: 'NEWEST' | 'OLDEST' = 'NEWEST', signal?: AbortSignal) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<Review>>>(`/api/books/${bookId}/reviews`, { params: { page, size, sort }, signal }));
}

// Backend has PUT/DELETE /me but no GET /me. Never infer absence from only page zero.
export async function findMyReview(bookId: number, userId: number, signal?: AbortSignal): Promise<Review | null> {
  for (let page = 0; ; page++) {
    const response = await getReviews(bookId, page, 100, 'NEWEST', signal);
    const own = response.content.find(review => review.user.id === userId);
    if (own) return own;
    if (response.last) return null;
  }
}

export async function getReviewSummary(bookId: number) {
  return getResponseData(await apiClient.get<ApiResponse<ReviewSummary>>(`/api/books/${bookId}/reviews/summary`));
}

export async function createReview(bookId: number, request: ReviewRequest) {
  return getResponseData(await apiClient.post<ApiResponse<Review>>(`/api/books/${bookId}/reviews`, request));
}

export async function updateMyReview(bookId: number, request: ReviewRequest) {
  return getResponseData(await apiClient.put<ApiResponse<Review>>(`/api/books/${bookId}/reviews/me`, request));
}

export async function deleteMyReview(bookId: number) {
  return getResponseData(await apiClient.delete<ApiResponse<null>>(`/api/books/${bookId}/reviews/me`));
}
