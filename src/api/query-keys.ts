import type { BookListParams } from '@/types/book.types';

export const queryKeys = {
  books: {
    all: ['books'] as const,
    detail: (bookId: number) => ['books', 'detail', bookId] as const,
    infinite: (params: Omit<BookListParams, 'page'>) => ['books', 'infinite', params] as const,
    list: (params: BookListParams) => ['books', 'list', params] as const,
    new: ['books', 'new'] as const,
    popular: ['books', 'popular'] as const,
    premium: ['books', 'premium'] as const,
  },
  categories: ['categories'] as const,
  favorites: {
    all: ['favorites'] as const,
    list: (page: number, size: number) => ['favorites', page, size] as const,
    status: (bookId: number) => ['favorites', 'status', bookId] as const,
  },
  library: ['library', 'summary'] as const,
  recommendations: {
    all: ['recommendations'] as const,
    list: (page: number, size: number) => ['recommendations', page, size] as const,
  },
  reviews: {
    all: (bookId: number) => ['reviews', bookId] as const,
    list: (bookId: number, page: number, size: number, sort: 'NEWEST' | 'OLDEST') => ['reviews', bookId, 'list', page, size, sort] as const,
    summary: (bookId: number) => ['reviews', bookId, 'summary'] as const,
  },
  subscription: {
    current: ['subscription', 'current'] as const,
    history: ['subscription', 'history'] as const,
  },
  user: {
    current: ['user', 'current'] as const,
    interests: ['user', 'interests'] as const,
  },
} as const;
