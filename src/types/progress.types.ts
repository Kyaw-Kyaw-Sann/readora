import type { Book } from '@/types/book.types';

export interface ReadingProgress {
  book: Book;
  currentPage: number;
  totalPages: number;
  completed: boolean;
  progressPercentage: number;
  lastAccessedAt: string | null;
  updatedAt: string | null;
}

export interface ListeningProgress {
  book: Book;
  currentSeconds: number;
  durationSeconds: number;
  completed: boolean;
  progressPercentage: number;
  lastAccessedAt: string | null;
  updatedAt: string | null;
}

export interface UpdateReadingProgressRequest {
  currentPage: number;
  totalPages: number;
}

export interface UpdateListeningProgressRequest {
  currentSeconds: number;
  durationSeconds: number;
}
