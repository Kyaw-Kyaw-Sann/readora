import type { Book } from '@/types/book.types';
import type { ListeningProgress, ReadingProgress } from '@/types/progress.types';
import type { SubscriptionPlan } from '@/types/subscription.types';
import type { AuthUser } from '@/types/auth.types';

export interface LibrarySubscription {
  premiumActive: boolean;
  plan: SubscriptionPlan | null;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | null;
  startedAt: string | null;
  expiresAt: string | null;
  cancelledAt: string | null;
}

export interface LibrarySummary {
  profile: AuthUser & { interests: string[] };
  subscription: LibrarySubscription;
  favorites: Book[];
  continueReading: ReadingProgress[];
  continueListening: ListeningProgress[];
  recentlyRead: ReadingProgress[];
  recentlyListened: ListeningProgress[];
}
