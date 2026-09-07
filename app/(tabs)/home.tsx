import { router, type Href } from 'expo-router';
import { ScrollView, Pressable, RefreshControl, Text, View } from 'react-native';

import { BookCard } from '@/components/books/book-card';
import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useBooks, useNewBooks, usePopularBooks } from '@/hooks/use-books';
import { useCategories } from '@/hooks/use-categories';
import { useLibrarySummary } from '@/hooks/use-library';
import { useRecommendations } from '@/hooks/use-recommendations';
import { useAuthStore } from '@/stores/auth-store';
import type { Book } from '@/types/book.types';
import type { ListeningProgress, ReadingProgress } from '@/types/progress.types';

function openBook(book: Book) {
  router.push(`/book/${book.id}` as Href);
}

function SectionTitle({ actionLabel, onAction, title }: { actionLabel?: string; onAction?: () => void; title: string }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="font-serif text-2xl text-text dark:text-text-dark">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" className="py-1" onPress={onAction}>
          <Text className="text-sm font-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HorizontalBooks({ books }: { books: Book[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pr-5">
      {books.map((book) => (
        <BookCard
          author={book.author}
          coverUrl={book.coverUrl}
          key={book.id}
          onPress={() => openBook(book)}
          premium={book.accessType === 'PREMIUM'}
          title={book.title}
        />
      ))}
    </ScrollView>
  );
}

function ContinueCard({ mode, progress }: { mode: 'reading' | 'listening'; progress: ReadingProgress | ListeningProgress }) {
  const destination = mode === 'reading' ? `/reader/${progress.book.id}` : `/player/${progress.book.id}`;
  const label = mode === 'reading' ? 'Continue reading' : 'Continue listening';

  return (
    <Pressable
      accessibilityHint={`Resumes ${progress.book.title}`}
      accessibilityRole="button"
      className="mr-4 w-72 rounded-2xl border border-border bg-surface p-4 active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark"
      onPress={() => router.push(destination as Href)}>
      <Text className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</Text>
      <Text className="mt-2 font-serif text-xl text-text dark:text-text-dark" numberOfLines={1}>{progress.book.title}</Text>
      <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark" numberOfLines={1}>{progress.book.author}</Text>
      <ProgressBar className="mt-4" value={progress.progressPercentage} />
      <Text className="mt-2 text-xs text-text-muted dark:text-text-muted-dark">{Math.round(progress.progressPercentage)}% complete</Text>
    </Pressable>
  );
}

export default function HomeTab() {
  const user = useAuthStore((state) => state.user);
  const library = useLibrarySummary();
  const recommendations = useRecommendations(0, 10);
  const popular = usePopularBooks();
  const newBooks = useNewBooks();
  const freeBooks = useBooks({ accessType: 'FREE', page: 0, size: 10 });
  const categories = useCategories();

  const refreshing = library.isRefetching || recommendations.isRefetching || popular.isRefetching || newBooks.isRefetching || freeBooks.isRefetching || categories.isRefetching;
  const refresh = () => {
    void Promise.all([library.refetch(), recommendations.refetch(), popular.refetch(), newBooks.refetch(), freeBooks.refetch(), categories.refetch()]);
  };
  const continueReading = library.data?.continueReading ?? [];
  const continueListening = library.data?.continueListening ?? [];
  const recommendedBooks = recommendations.data?.content.map((item) => item.book) ?? [];

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-background-dark"
      contentContainerClassName="pb-10"
      refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor="#D99113" />}>
      <View className="px-5 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <BrandLogo size="sm" />
            <Text className="font-serif text-2xl text-primary">Readora</Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable accessibilityLabel="Search books" accessibilityRole="button" className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface dark:border-border-dark dark:bg-surface-dark" onPress={() => router.push('/search' as Href)}>
              <Text className="text-2xl text-primary">⌕</Text>
            </Pressable>
            <ThemeToggle />
          </View>
        </View>

        <Text className="mt-6 text-base text-text-muted dark:text-text-muted-dark">Welcome back{user?.name ? `, ${user.name}` : ''}</Text>
        <Text className="mt-1 font-serif text-3xl text-text dark:text-text-dark">Find your next great read.</Text>

        <View className="mt-6 overflow-hidden rounded-3xl bg-primary-soft px-6 py-7 dark:bg-surface-dark">
          <Text className="font-serif text-3xl text-text dark:text-text-dark">Stories made for you</Text>
          <Text className="mt-3 max-w-xs text-base leading-6 text-text-muted dark:text-text-muted-dark">Explore books chosen from your interests, reading history, and favorites.</Text>
          <AppButton className="mt-5 self-start" label="Explore books" onPress={() => router.push('/search' as Href)} />
        </View>
      </View>

      {library.isLoading ? <LoadingState label="Loading your library..." /> : null}
      {library.isError ? <ErrorState onRetry={() => void library.refetch()} title="Your library could not be loaded." /> : null}
      {continueReading.length ? (
        <View className="mt-8">
          <View className="px-5"><SectionTitle title="Continue Reading" /></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pl-5 pr-1">
            {continueReading.map((progress) => <ContinueCard key={progress.book.id} mode="reading" progress={progress} />)}
          </ScrollView>
        </View>
      ) : null}
      {continueListening.length ? (
        <View className="mt-8">
          <View className="px-5"><SectionTitle title="Continue Listening" /></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pl-5 pr-1">
            {continueListening.map((progress) => <ContinueCard key={progress.book.id} mode="listening" progress={progress} />)}
          </ScrollView>
        </View>
      ) : null}

      <View className="mt-8">
        <View className="px-5"><SectionTitle title="Categories" /></View>
        {categories.isLoading ? <LoadingState label="Loading categories..." /> : null}
        {categories.isError ? <ErrorState onRetry={() => void categories.refetch()} title="Categories could not be loaded." /> : null}
        {categories.data?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5">
            {categories.data.map((category) => (
              <View className="rounded-xl border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark" key={category.id}>
                <Text className="font-medium text-text dark:text-text-dark">{category.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <HomeBookSection books={recommendedBooks} error={recommendations.isError} loading={recommendations.isLoading} onRetry={() => void recommendations.refetch()} title="Recommended for You" />
      <HomeBookSection books={popular.data ?? []} error={popular.isError} loading={popular.isLoading} onRetry={() => void popular.refetch()} title="Popular" />
      <HomeBookSection books={newBooks.data ?? []} error={newBooks.isError} loading={newBooks.isLoading} onRetry={() => void newBooks.refetch()} title="New Arrivals" />
      <HomeBookSection books={freeBooks.data?.content ?? []} error={freeBooks.isError} loading={freeBooks.isLoading} onRetry={() => void freeBooks.refetch()} title="Free Books" />

      {!library.isLoading && !library.isError && !continueReading.length && !continueListening.length ? (
        <EmptyState description="Explore a book to begin building your reading library." title="Your journey starts here" />
      ) : null}
    </ScrollView>
  );
}

function HomeBookSection({ books, error, loading, onRetry, title }: { books: Book[]; error: boolean; loading: boolean; onRetry: () => void; title: string }) {
  return (
    <View className="mt-9">
      <View className="px-5"><SectionTitle title={title} /></View>
      {loading ? <LoadingState label={`Loading ${title.toLowerCase()}...`} /> : null}
      {error ? <ErrorState onRetry={onRetry} title={`${title} could not be loaded.`} /> : null}
      {!loading && !error && books.length ? <HorizontalBooks books={books} /> : null}
      {!loading && !error && !books.length ? <EmptyState description="More books will appear here when available." title={`No ${title.toLowerCase()} yet`} /> : null}
    </View>
  );
}
