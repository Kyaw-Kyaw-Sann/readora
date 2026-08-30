import type { Book } from '@/types/book.types';

export interface Recommendation {
  book: Book;
  score: number;
}
