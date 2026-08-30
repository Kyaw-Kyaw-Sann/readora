import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse, PageResponse } from '@/types/api.types';
import type { Book, BookListParams, ProtectedBookResource } from '@/types/book.types';

export async function getBooks(params: BookListParams = {}) {
  return getResponseData(await apiClient.get<ApiResponse<PageResponse<Book>>>('/api/books', { params }));
}

export async function getBook(bookId: number) {
  return getResponseData(await apiClient.get<ApiResponse<Book>>(`/api/books/${bookId}`));
}

export async function getNewBooks() {
  return getResponseData(await apiClient.get<ApiResponse<Book[]>>('/api/books/new'));
}

export async function getPopularBooks() {
  return getResponseData(await apiClient.get<ApiResponse<Book[]>>('/api/books/popular'));
}

export async function getPremiumBooks() {
  return getResponseData(await apiClient.get<ApiResponse<Book[]>>('/api/books/premium'));
}

export async function getBookPdf(bookId: number) {
  return getResponseData(await apiClient.get<ApiResponse<ProtectedBookResource>>(`/api/books/${bookId}/pdf`));
}

export async function getBookAudio(bookId: number) {
  return getResponseData(await apiClient.get<ApiResponse<ProtectedBookResource>>(`/api/books/${bookId}/audio`));
}
