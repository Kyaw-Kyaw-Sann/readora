import type { Category } from '@/types/category.types';

export type BookAccessType = 'FREE' | 'PREMIUM';
export type BookStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type BookSort = 'NEWEST' | 'POPULAR';

export interface Book {
  id: number;
  title: string;
  description?: string;
  isbn?: string | null;
  language?: string | null;
  publicationDate?: string | null;
  author: string;
  coverUrl: string | null;
  pdfUrl?: string | null;
  audioUrl?: string | null;
  pageCount?: number | null;
  audioDurationSeconds?: number | null;
  accessType: BookAccessType;
  status?: BookStatus;
  viewCount: number;
  categories: Category[];
  createdAt: string;
  updatedAt?: string;
}

export interface BookListParams {
  accessType?: BookAccessType;
  categoryId?: number;
  page?: number;
  search?: string;
  size?: number;
  sort?: BookSort;
}

export interface ProtectedBookResource {
  bookId: number;
  url: string;
}
