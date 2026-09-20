import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Rating } from '@/components/books/rating';
import { queryKeys } from '@/api/query-keys';
import { MyReview } from '@/components/reviews/my-review';
import { ReviewCard } from '@/components/reviews/review-card';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { colors } from '@/constants/theme';
import { useBook } from '@/hooks/use-books';
import { useReviews, useReviewSummary } from '@/hooks/use-reviews';
import { useAuthStore } from '@/stores/auth-store';

function Reviews({bookId}: {bookId:number}) {
  const [page,setPage] = useState(0);
  const [sort,setSort] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [refreshing,setRefreshing] = useState(false);
  const router = useRouter();
  const client = useQueryClient();
  const {colorScheme} = useColorScheme();
  const userId = useAuthStore(state=>state.user?.id);
  const book = useBook(bookId);
  const summary = useReviewSummary(bookId);
  const list = useReviews(bookId,page,10,sort);
  const refresh = async ()=>{
    setRefreshing(true);
    try {await Promise.all([client.invalidateQueries({queryKey:queryKeys.reviews.all(bookId)}),book.refetch()]);}
    finally {setRefreshing(false);}
  };
  return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top','bottom']}>
    <View className="flex-row items-center gap-3 px-4 py-2"><Pressable accessibilityRole="button" accessibilityLabel="Back" className="min-h-12 min-w-12 items-center justify-center" onPress={()=>router.back()}><AppIcon name="arrow-left" color={colorScheme==='dark' ? colors.textDark : colors.text} /></Pressable><Text className="flex-1 font-serif text-2xl text-text dark:text-text-dark">Reviews & Ratings</Text></View>
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS==='ios' ? 'padding' : undefined}>
      <FlatList data={list.isError ? [] : list.data?.content ?? []} keyExtractor={review=>String(review.id)}
        contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled"
        refreshing={refreshing} onRefresh={()=>void refresh()}
        ListHeaderComponent={<View>
          {book.data ? <Text className="mt-3 font-serif text-xl text-text dark:text-text-dark">{book.data.title}</Text> : book.isError ? <ErrorState title="Book title could not be loaded." onRetry={()=>void book.refetch()} /> : null}
          {summary.isPending ? <LoadingState label="Loading ratings…" /> : summary.isError ? <ErrorState title="Ratings could not be loaded." onRetry={()=>void summary.refetch()} /> : summary.data ? <View className="mt-4 gap-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"><Rating value={summary.data.averageRating} /><Text className="text-sm text-text-muted dark:text-text-muted-dark">{summary.data.reviewCount} reviews</Text></View> : null}
          <MyReview key={`${bookId}-${userId ?? 0}`} bookId={bookId} />
          <View className="mt-7 flex-row items-center justify-between"><Text className="font-serif text-xl text-text dark:text-text-dark">All reviews</Text><View className="flex-row">{(['NEWEST','OLDEST'] as const).map(value=><AppButton key={value} className="px-3" label={value==='NEWEST' ? 'Newest' : 'Oldest'} variant={sort===value ? 'secondary' : 'ghost'} accessibilityState={{selected:sort===value}} onPress={()=>{setSort(value);setPage(0);}} />)}</View></View>
        </View>}
        renderItem={({item})=><ReviewCard review={item} own={item.user.id===userId} />}
        ListEmptyComponent={list.isPending ? <LoadingState label="Loading reviews…" /> : list.isError ? <ErrorState title={list.error.message} onRetry={()=>void list.refetch()} /> : <EmptyState title="No reviews on this page" description="Share your thoughts or return to the previous page." />}
        ListFooterComponent={<View className="mt-5 flex-row items-center justify-between gap-2"><AppButton label="Previous" variant="outline" disabled={page===0 || list.isFetching} onPress={()=>setPage(value=>Math.max(0,value-1))} /><Text className="text-sm text-text-muted dark:text-text-muted-dark">Page {page+1}</Text><AppButton label="Next" variant="outline" disabled={!list.data || list.data.last || list.isFetching || list.isError} onPress={()=>setPage(value=>value+1)} /></View>} />
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export default function ReviewsScreen() {
  const {bookId} = useLocalSearchParams<{bookId:string}>();
  const id = Number(bookId);
  if (!Number.isSafeInteger(id) || id<=0) return <ErrorState title="Invalid book." />;
  return <Reviews key={id} bookId={id} />;
}
