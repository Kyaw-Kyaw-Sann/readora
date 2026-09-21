import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share as NativeShare, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { normalizeApiError } from '@/api/api-error';
import { PremiumBadge } from '@/components/books/premium-badge';
import { Rating } from '@/components/books/rating';
import { ReviewCard } from '@/components/reviews/review-card';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { colors } from '@/constants/theme';
import { useBook } from '@/hooks/use-books';
import { useFavoriteStatus, useToggleFavorite } from '@/hooks/use-favorites';
import { useReviews, useReviewSummary } from '@/hooks/use-reviews';
import { useAuthStore } from '@/stores/auth-store';
import type { Book } from '@/types/book.types';

function formatDate(value?: string | null) {
  if (!value) return 'Not provided';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatDuration(totalSeconds?: number | null) {
  if (!totalSeconds) return 'Not provided';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-4 w-[48%] rounded-xl border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
      <Text className="text-xs uppercase tracking-wide text-text-muted dark:text-text-muted-dark">{label}</Text>
      <Text className="mt-1 font-medium text-text dark:text-text-dark" numberOfLines={2}>{value}</Text>
    </View>
  );
}


function AccessBadge({ book }: { book: Book }) {
  if (book.accessType === 'PREMIUM') return <PremiumBadge />;

  return (
    <View className="self-start rounded-full bg-success px-3 py-1.5">
      <Text className="text-[10px] font-bold tracking-wide text-white">FREE</Text>
    </View>
  );
}

export default function BookDetailScreen() {
  const params = useLocalSearchParams<{ bookId?: string | string[] }>();
  const rawBookId = Array.isArray(params.bookId) ? params.bookId[0] : params.bookId;
  const bookId = Number(rawBookId);
  const validBookId = Number.isInteger(bookId) && bookId > 0;
  const { width } = useWindowDimensions();
  const narrowLayout = width < 360;
  const coverWidth = narrowLayout ? 180 : Math.min(146, width * 0.38);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const bookQuery = useBook(bookId, validBookId);
  const favoriteStatusQuery = useFavoriteStatus(bookId, validBookId);
  const favoriteMutation = useToggleFavorite(bookId);
  const summaryQuery = useReviewSummary(bookId, validBookId);
  const reviewsQuery = useReviews(bookId, 0, 3, 'NEWEST', validBookId);
  const book = bookQuery.data;

  const shareBook = async () => {
    if (!book) return;

    setShareError(null);
    try {
      await NativeShare.share({ message: `${book.title} by ${book.author}`, title: book.title });
    } catch (error) {
      setShareError(normalizeApiError(error).message);
    }
  };

  const toggleFavorite = () => {
    if (!favoriteStatusQuery.data || favoriteMutation.isPending) return;

    favoriteMutation.mutate(favoriteStatusQuery.data.favorite);
  };

  if (!validBookId) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <ErrorState title="This book link is invalid." />
      </SafeAreaView>
    );
  }

  if (bookQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <LoadingState label="Loading book details..." />
      </SafeAreaView>
    );
  }

  if (bookQuery.isError || !book) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <View className="px-5 pt-2">
          <Pressable accessibilityLabel="Go back" className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface dark:border-border-dark dark:bg-surface-dark" onPress={() => router.back()}>
            <AppIcon color={colors.textMuted} name="arrow-left" size={22} />
          </Pressable>
        </View>
        <ErrorState onRetry={() => void bookQuery.refetch()} title={bookQuery.error ? normalizeApiError(bookQuery.error).message : 'Book details could not be loaded.'} />
      </SafeAreaView>
    );
  }

  const premiumAccessRequired = book.accessType === 'PREMIUM' && user?.subscriptionStatus !== 'ACTIVE';
  const latestReviews = reviewsQuery.data?.content ?? [];
  const descriptionCanExpand = (book.description?.length ?? 0) > 180;
  const favoriteError = favoriteStatusQuery.error || favoriteMutation.error;
  const isFavorite = favoriteStatusQuery.data?.favorite ?? false;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between py-2">
          <Pressable accessibilityLabel="Go back" className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark" onPress={() => router.back()}>
            <AppIcon color={colors.textMuted} name="arrow-left" size={22} />
          </Pressable>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityRole="button"
              className={`h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark ${!favoriteStatusQuery.data || favoriteMutation.isPending ? 'opacity-50' : ''}`}
              disabled={!favoriteStatusQuery.data || favoriteMutation.isPending}
              onPress={toggleFavorite}>
              {favoriteStatusQuery.isLoading || favoriteMutation.isPending ? <ActivityIndicator color={colors.primary} size="small" /> : <AppIcon color={isFavorite ? colors.danger : colors.textMuted} filled={isFavorite} name="heart" size={21} />}
            </Pressable>
            <Pressable accessibilityLabel="Share book" className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark" onPress={() => void shareBook()}>
              <AppIcon color={colors.textMuted} name="share" size={21} />
            </Pressable>
          </View>
        </View>
        {shareError ? <Text className="mt-2 text-right text-sm text-danger">{shareError}</Text> : null}
        {favoriteStatusQuery.isError ? (
          <Pressable accessibilityRole="button" className="mt-2 self-end" onPress={() => void favoriteStatusQuery.refetch()}>
            <Text className="text-sm text-danger">Favorites could not be loaded. Retry</Text>
          </Pressable>
        ) : null}
        {favoriteMutation.isError ? <Text className="mt-2 text-right text-sm text-danger">{normalizeApiError(favoriteError).message}</Text> : null}

        <View className={`mt-5 ${narrowLayout ? 'items-center' : 'flex-row items-start'}`}>
          <View className="overflow-hidden rounded-2xl bg-primary-soft dark:bg-surface-dark" style={{ height: coverWidth * 1.45, width: coverWidth }}>
            {book.coverUrl ? (
              <Image accessibilityLabel={`${book.title} cover`} className="h-full w-full" contentFit="cover" source={{ uri: book.coverUrl }} transition={200} />
            ) : (
              <View className="flex-1 items-center justify-center px-4">
                <AppIcon color={colors.primaryDark} name="library" size={42} />
                <Text className="mt-3 text-center text-sm text-primary-dark">No cover available</Text>
              </View>
            )}
          </View>

          <View className={`${narrowLayout ? 'mt-5 w-full items-center' : 'ml-5 flex-1 items-start'}`}>
            <AccessBadge book={book} />
            <Text className={`mt-4 font-serif text-3xl text-text dark:text-text-dark ${narrowLayout ? 'text-center' : ''}`}>{book.title}</Text>
            <Text className={`mt-2 text-lg font-semibold text-primary-dark dark:text-primary ${narrowLayout ? 'text-center' : ''}`}>{book.author}</Text>
            {summaryQuery.data && summaryQuery.data.reviewCount > 0 ? (
              <View className="mt-4 flex-row items-center">
                <Rating value={summaryQuery.data.averageRating} />
                <Text className="ml-3 text-sm text-text-muted dark:text-text-muted-dark">{summaryQuery.data.reviewCount} reviews</Text>
              </View>
            ) : null}
          </View>
        </View>

        {book.categories.length ? (
          <View className="mt-6 flex-row flex-wrap gap-2">
            {book.categories.map((category) => (
              <View className="rounded-full border border-border bg-surface px-3 py-2 dark:border-border-dark dark:bg-surface-dark" key={category.id}>
                <Text className="text-sm text-primary-dark dark:text-primary">{category.name}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-7">
          <Text className="font-serif text-2xl text-text dark:text-text-dark">About this book</Text>
          {book.description ? (
            <>
              <Text className="mt-3 text-base leading-7 text-text-muted dark:text-text-muted-dark" numberOfLines={descriptionExpanded ? undefined : 5}>{book.description}</Text>
              {descriptionCanExpand ? (
                <Pressable accessibilityRole="button" className="mt-2 self-start py-1" onPress={() => setDescriptionExpanded((current) => !current)}>
                  <Text className="font-semibold text-primary">{descriptionExpanded ? 'Less' : 'More'}</Text>
                </Pressable>
              ) : null}
            </>
          ) : <Text className="mt-3 text-text-muted dark:text-text-muted-dark">No description is available.</Text>}
        </View>

        <View className="mt-7">
          <Text className="font-serif text-2xl text-text dark:text-text-dark">Book details</Text>
          <View className="mt-4 flex-row flex-wrap justify-between">
            <MetadataItem label="Language" value={book.language || 'Not provided'} />
            <MetadataItem label="Published" value={formatDate(book.publicationDate)} />
            <MetadataItem label="Pages" value={book.pageCount ? String(book.pageCount) : 'Not provided'} />
            <MetadataItem label="Audio length" value={formatDuration(book.audioDurationSeconds)} />
          </View>
        </View>

        <View className="mt-3 gap-3">
          {premiumAccessRequired ? (
            <>
              <View className="rounded-2xl border border-primary/30 bg-primary-soft p-4 dark:bg-surface-dark">
                <Text className="font-semibold text-text dark:text-text-dark">Premium access required</Text>
                <Text className="mt-1 text-sm leading-5 text-text-muted dark:text-text-muted-dark">Activate a premium plan to access this book.</Text>
              </View>
              <AppButton label="View Premium Plans" onPress={() => router.push('/premium' as Href)} />
            </>
          ) : (
            <>
              {book.hasPdf ? <AppButton label="Read" onPress={() => router.push(`/reader/${book.id}` as Href)} /> : null}
              {book.hasAudio ? <AppButton label="Listen" onPress={() => router.push(`/player/${book.id}` as Href)} variant="outline" /> : null}
              {!book.hasPdf && !book.hasAudio ? (
                <View className="rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                  <Text className="text-center text-text-muted dark:text-text-muted-dark">Reading and audio resources are not available for this book.</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View className="mt-9">
          <View className="flex-row items-center justify-between">
            <Text className="font-serif text-2xl text-text dark:text-text-dark">Reviews</Text>
            <AppButton label="View all / Write" variant="ghost" onPress={() => router.push(`/book/${book.id}/reviews` as Href)} />
          </View>
          {summaryQuery.isLoading ? <LoadingState label="Loading rating summary..." /> : null}
          {summaryQuery.isError ? <ErrorState onRetry={() => void summaryQuery.refetch()} title="Rating summary could not be loaded." /> : null}
          {summaryQuery.data && summaryQuery.data.reviewCount > 0 ? (
            <View className="mt-3 flex-row items-end rounded-2xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
              <Text className="font-serif text-5xl text-text dark:text-text-dark">{summaryQuery.data.averageRating.toFixed(1)}</Text>
              <View className="mb-1 ml-4">
                <Rating value={summaryQuery.data.averageRating} />
                <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">Based on {summaryQuery.data.reviewCount} reviews</Text>
              </View>
            </View>
          ) : null}

          {reviewsQuery.isLoading ? <LoadingState label="Loading latest reviews..." /> : null}
          {reviewsQuery.isError ? <ErrorState onRetry={() => void reviewsQuery.refetch()} title="Latest reviews could not be loaded." /> : null}
          {!reviewsQuery.isLoading && !reviewsQuery.isError && latestReviews.length ? latestReviews.map((review) => <ReviewCard key={review.id} review={review} />) : null}
          {!reviewsQuery.isLoading && !reviewsQuery.isError && !latestReviews.length ? <EmptyState description="Be the first to share your thoughts. Tap View all / Write." title="No reviews yet" /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
