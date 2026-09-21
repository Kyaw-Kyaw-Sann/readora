import { router, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BookCard } from '@/components/books/book-card';
import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { colors } from '@/constants/theme';
import { useBooks, useNewBooks, usePopularBooks } from '@/hooks/use-books';
import { useCategories } from '@/hooks/use-categories';
import { useLibrarySummary } from '@/hooks/use-library';
import { useRecommendations } from '@/hooks/use-recommendations';
import type { Book } from '@/types/book.types';
import type { ListeningProgress, ReadingProgress } from '@/types/progress.types';

const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1781813785076-906e1666f68e?auto=format&fit=crop&w=1200&q=82';

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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 px-5">
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
      className="mr-4 w-80 flex-row rounded-2xl border border-border bg-surface p-3 active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark"
      onPress={() => router.push(destination as Href)}>
      <View className="h-28 w-20 overflow-hidden rounded-xl bg-primary-soft dark:bg-border-dark">
        {progress.book.coverUrl ? (
          <Image
            accessibilityLabel={`${progress.book.title} cover`}
            className="h-full w-full"
            contentFit="cover"
            source={{ uri: progress.book.coverUrl }}
            transition={180}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-2">
            <AppIcon color={colors.primaryDark} name={mode === 'reading' ? 'library' : 'headphones'} size={26} />
          </View>
        )}
      </View>
      <View className="ml-4 flex-1 py-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</Text>
          <AppIcon color={colors.primary} name={mode === 'reading' ? 'library' : 'headphones'} size={18} />
        </View>
        <Text className="mt-2 font-serif text-lg text-text dark:text-text-dark" numberOfLines={2}>{progress.book.title}</Text>
        <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark" numberOfLines={1}>{progress.book.author}</Text>
        <View className="mt-auto">
          <ProgressBar value={progress.progressPercentage} />
          <Text className="mt-2 text-xs text-text-muted dark:text-text-muted-dark">{Math.round(progress.progressPercentage)}% complete</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeTab() {
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
          <View className="mr-3 flex-1 flex-row items-center">
            <BrandLogo size="md" />
            <View className="ml-3 flex-1">
              <Text className="font-serif text-3xl text-primary">Readora</Text>
              <Text className="text-xs text-text-muted dark:text-text-muted-dark">Stories that stay with you.</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <Pressable accessibilityLabel="Search books" accessibilityRole="button" className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark" onPress={() => router.push('/search' as Href)}>
              <AppIcon color={colors.primaryDark} name="search" size={22} />
            </Pressable>
            <ThemeToggle />
          </View>
        </View>

        <View className="mt-6 h-64 overflow-hidden rounded-3xl bg-primary-soft dark:bg-surface-dark">
          <Image accessibilityLabel="Open books in warm sunlight" contentFit="cover" source={{ uri: HERO_IMAGE_URL }} style={StyleSheet.absoluteFill} transition={250} />
          <View className="absolute inset-0 bg-black/40" />
          <View className="flex-1 justify-end p-6">
            <Text className="max-w-xs font-serif text-3xl text-white">Stories made for you</Text>
            <Text className="mt-2 max-w-xs text-sm leading-5 text-white/90">Books selected from your interests, reading history, and favorites.</Text>
            <AppButton className="mt-4 self-start" label="Explore books" onPress={() => router.push('/search' as Href)} />
          </View>
        </View>
      </View>

      {library.isLoading ? <LoadingState label="Loading your library..." /> : null}
      {library.isError ? <ErrorState onRetry={() => void library.refetch()} title="Your library could not be loaded." /> : null}
      {continueReading.length ? (
        <View className="mt-8">
          <View className="px-5"><SectionTitle actionLabel="View all" onAction={() => router.push('/library' as Href)} title="Continue Reading" /></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pl-5 pr-1">
            {continueReading.map((progress) => <ContinueCard key={progress.book.id} mode="reading" progress={progress} />)}
          </ScrollView>
        </View>
      ) : null}
      {continueListening.length ? (
        <View className="mt-8">
          <View className="px-5"><SectionTitle actionLabel="View all" onAction={() => router.push('/library' as Href)} title="Continue Listening" /></View>
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
              <View className="w-36 flex-row items-center rounded-2xl border border-border bg-surface px-4 py-4 dark:border-border-dark dark:bg-surface-dark" key={category.id}>
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-primary-soft dark:bg-border-dark">
                  <AppIcon color={colors.primaryDark} name="library" size={19} />
                </View>
                <Text className="flex-1 font-medium text-text dark:text-text-dark" numberOfLines={2}>{category.name}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      <HomeBookSection books={recommendedBooks} error={recommendations.isError} loading={recommendations.isLoading} onRetry={() => void recommendations.refetch()} title="Recommended for You" />
      <HomeBookSection books={popular.data?.content ?? []} error={popular.isError} loading={popular.isLoading} onRetry={() => void popular.refetch()} title="Popular" />
      <HomeBookSection books={newBooks.data?.content ?? []} error={newBooks.isError} loading={newBooks.isLoading} onRetry={() => void newBooks.refetch()} title="New Arrivals" />
      <HomeBookSection books={freeBooks.data?.content ?? []} error={freeBooks.isError} loading={freeBooks.isLoading} onRetry={() => void freeBooks.refetch()} title="Free Books" />

    </ScrollView>
  );
}

function HomeBookSection({ books, error, loading, onRetry, title }: { books: Book[]; error: boolean; loading: boolean; onRetry: () => void; title: string }) {
  return (
    <View className="mt-9">
      <View className="px-5"><SectionTitle actionLabel="View all" onAction={() => router.push('/search' as Href)} title={title} /></View>
      {loading ? <LoadingState label={`Loading ${title.toLowerCase()}...`} /> : null}
      {error ? <ErrorState onRetry={onRetry} title={`${title} could not be loaded.`} /> : null}
      {!loading && !error && books.length ? <HorizontalBooks books={books} /> : null}
      {!loading && !error && !books.length ? <EmptyState description="More books will appear here when available." title={`No ${title.toLowerCase()} yet`} /> : null}
    </View>
  );
}
