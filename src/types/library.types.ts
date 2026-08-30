import type { Book } from '@/types/book.types';
import type { ListeningProgress, ReadingProgress } from '@/types/progress.types';
import type { Subscription } from '@/types/subscription.types';
import type { AuthUser } from '@/types/auth.types';

export interface LibrarySubscription extends Omit<Subscription, 'id'> {
  premiumActive: boolean;
}

export interface LibrarySummary {
  profile: AuthUser & { interests: string[] };
  subscription: LibrarySubscription | null;
  favorites: Book[];
  continueReading: ReadingProgress[];
  continueListening: ListeningProgress[];
  recentlyRead: ReadingProgress[];
  recentlyListened: ListeningProgress[];
}
