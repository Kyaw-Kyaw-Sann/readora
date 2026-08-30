import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse, PageResponse } from '@/types/api.types';
import type { Review, ReviewRequest, ReviewSummary } from '@/types/review.types';

export async function getReviews(bookId: number, page = 0, size = 10, sort: 'NEWEST' | 'OLDEST' = 'NEWEST') {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<Review>>>(`/api/books/${bookId}/reviews`, { params: { page, size, sort } }));
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
