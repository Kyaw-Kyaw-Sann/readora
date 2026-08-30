import { useQuery } from '@tanstack/react-query';

import { getBook, getBooks, getNewBooks, getPopularBooks, getPremiumBooks } from '@/api/books.api';
import { queryKeys } from '@/api/query-keys';
import type { BookListParams } from '@/types/book.types';

export function useBooks(params: BookListParams = {}, enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.books.list(params), queryFn: () => getBooks(params) });
}

export function useBook(bookId: number, enabled = true) {
  return useQuery({ enabled: enabled && Number.isFinite(bookId), queryKey: queryKeys.books.detail(bookId), queryFn: () => getBook(bookId) });
}

export function useNewBooks(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.books.new, queryFn: getNewBooks });
}

export function usePopularBooks(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.books.popular, queryFn: getPopularBooks });
}

export function usePremiumBooks(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.books.premium, queryFn: getPremiumBooks });
}
