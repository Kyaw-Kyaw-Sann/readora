import { router, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { BookCard } from '@/components/books/book-card';
import { BrandLogo } from '@/components/brand/brand-logo';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { colors } from '@/constants/theme';
import { useLibrarySummary } from '@/hooks/use-library';
import type { Book } from '@/types/book.types';
import type { LibrarySubscription } from '@/types/library.types';
import type { ListeningProgress, ReadingProgress } from '@/types/progress.types';

type ProgressMode = 'reading' | 'listening';

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatDuration(totalSeconds: number | null) {
  if (totalSeconds === null) return 'Unknown duration';
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function SubscriptionSummary({ subscription }: { subscription: LibrarySubscription }) {
  const expiry = formatDate(subscription.expiresAt);
  const details = [
    subscription.plan ? `${subscription.plan.toLowerCase()} plan` : null,
    subscription.status?.toLowerCase() ?? null,
    expiry ? `until ${expiry}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <View className="mt-6 rounded-3xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-soft dark:bg-border-dark">
          <AppIcon color={colors.primaryDark} name="library" size={24} />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xs font-semibold uppercase tracking-wider text-primary">Membership</Text>
          <Text className="mt-1 font-serif text-2xl text-text dark:text-text-dark">
            {subscription.premiumActive ? 'Premium access' : 'Free access'}
          </Text>
        </View>
        {subscription.premiumActive ? <Text className="font-bold text-primary">ACTIVE</Text> : null}
      </View>
      <Text className="mt-4 border-t border-border pt-4 text-sm text-text-muted dark:border-border-dark dark:text-text-muted-dark">
        {details || 'Free books remain available with your verified account.'}
      </Text>
    </View>
  );
}

function SectionEmpty({ message }: { message: string }) {
  return (
    <View className="mx-5 rounded-2xl border border-border bg-surface px-5 py-6 dark:border-border-dark dark:bg-surface-dark">
      <Text className="text-center text-sm text-text-muted dark:text-text-muted-dark">{message}</Text>
    </View>
  );
}

function BookSection({ books, emptyMessage, title }: { books: Book[]; emptyMessage: string; title: string }) {
  return (
    <View className="mt-9">
      <SectionHeader className="mb-4 px-5" title={title} />
      {books.length ? (
        <ScrollView contentContainerClassName="gap-4 px-5" horizontal showsHorizontalScrollIndicator={false}>
          {books.map((book) => (
            <BookCard
              author={book.author}
              coverUrl={book.coverUrl}
              key={book.id}
              onPress={() => router.push(`/book/${book.id}` as Href)}
              premium={book.accessType === 'PREMIUM'}
              title={book.title}
            />
          ))}
        </ScrollView>
      ) : <SectionEmpty message={emptyMessage} />}
    </View>
  );
}

function ProgressCard({ mode, progress }: { mode: ProgressMode; progress: ReadingProgress | ListeningProgress }) {
  const reading = mode === 'reading';
  const destination = reading ? `/reader/${progress.book.id}` : `/player/${progress.book.id}`;
  const detail = reading
    ? `Page ${(progress as ReadingProgress).currentPage}${(progress as ReadingProgress).totalPages ? ` of ${(progress as ReadingProgress).totalPages}` : ''}`
    : `${formatDuration((progress as ListeningProgress).currentSeconds)} of ${formatDuration((progress as ListeningProgress).durationSeconds)}`;

  return (
    <Pressable
      accessibilityHint={`Resume ${progress.book.title}`}
      accessibilityRole="button"
      className="mr-4 w-80 flex-row rounded-2xl border border-border bg-surface p-3 active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark"
      onPress={() => router.push(destination as Href)}>
      <View className="h-32 w-24 overflow-hidden rounded-xl bg-primary-soft dark:bg-border-dark">
        {progress.book.coverUrl ? (
          <Image accessibilityLabel={`${progress.book.title} cover`} className="h-full w-full" contentFit="cover" source={{ uri: progress.book.coverUrl }} transition={180} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <AppIcon color={colors.primaryDark} name={reading ? 'library' : 'headphones'} size={28} />
          </View>
        )}
      </View>
      <View className="ml-4 flex-1 py-1">
        <View className="flex-row items-center">
          <AppIcon color={colors.primary} name={reading ? 'library' : 'headphones'} size={17} />
          <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-primary">
            {reading ? 'Continue reading' : 'Continue listening'}
          </Text>
        </View>
        <Text className="mt-3 font-serif text-lg text-text dark:text-text-dark" numberOfLines={2}>{progress.book.title}</Text>
        <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark" numberOfLines={1}>{progress.book.author}</Text>
        <View className="mt-auto">
          <ProgressBar value={progress.progressPercentage} />
          <View className="mt-2 flex-row justify-between">
            <Text className="text-xs text-text-muted dark:text-text-muted-dark">{detail}</Text>
            <Text className="text-xs font-semibold text-primary">{progress.progressPercentage}%</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function ProgressSection({
  emptyMessage,
  items,
  mode,
  title,
}: {
  emptyMessage: string;
  items: (ReadingProgress | ListeningProgress)[];
  mode: ProgressMode;
  title: string;
}) {
  return (
    <View className="mt-9">
      <SectionHeader className="mb-4 px-5" title={title} />
      {items.length ? (
        <ScrollView contentContainerClassName="pl-5 pr-1" horizontal showsHorizontalScrollIndicator={false}>
          {items.map((progress) => <ProgressCard key={progress.book.id} mode={mode} progress={progress} />)}
        </ScrollView>
      ) : <SectionEmpty message={emptyMessage} />}
    </View>
  );
}

export default function LibraryTab() {
  const libraryQuery = useLibrarySummary();

  if (libraryQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <LoadingState label="Loading your library..." />
      </View>
    );
  }

  if (libraryQuery.isError || !libraryQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ErrorState
          onRetry={() => void libraryQuery.refetch()}
          title={libraryQuery.error ? normalizeApiError(libraryQuery.error).message : 'Your library could not be loaded.'}
        />
      </View>
    );
  }

  const library = libraryQuery.data;
  const hasLibraryActivity = library.favorites.length > 0
    || library.continueReading.length > 0
    || library.continueListening.length > 0
    || library.recentlyRead.length > 0
    || library.recentlyListened.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerClassName="pb-10"
      refreshControl={(
        <RefreshControl
          onRefresh={() => void libraryQuery.refetch()}
          refreshing={libraryQuery.isRefetching}
          tintColor={colors.primary}
        />
      )}
      showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="mr-4 flex-1 flex-row items-center">
            <BrandLogo size="md" />
            <View className="ml-3 flex-1">
              <Text className="font-serif text-3xl text-text dark:text-text-dark">My Library</Text>
              <Text className="mt-0.5 text-xs text-text-muted dark:text-text-muted-dark" numberOfLines={1}>
                {`${library.profile.name}'s saved stories and progress`}
              </Text>
            </View>
          </View>
          <ThemeToggle />
        </View>

        <SubscriptionSummary subscription={library.subscription} />
      </View>

      {!hasLibraryActivity ? (
        <EmptyState description="Add favorites or start a book to build your personal library." title="Your library is ready" />
      ) : null}

      <BookSection books={library.favorites} emptyMessage="Books you favorite will appear here." title="Favorite Books" />
      <ProgressSection emptyMessage="Start a PDF book to continue it here." items={library.continueReading} mode="reading" title="Continue Reading" />
      <ProgressSection emptyMessage="Start an audiobook to continue it here." items={library.continueListening} mode="listening" title="Continue Listening" />
      <BookSection books={library.recentlyRead.map((progress) => progress.book)} emptyMessage="Recently read books will appear here." title="Recently Read" />
      <BookSection books={library.recentlyListened.map((progress) => progress.book)} emptyMessage="Recently listened books will appear here." title="Recently Listened" />
    </ScrollView>
  );
}
