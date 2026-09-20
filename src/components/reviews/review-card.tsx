import { Text, View } from 'react-native';

import { Rating } from '@/components/books/rating';
import type { Review } from '@/types/review.types';

export function ReviewCard({review,own=false}: {review:Review;own?:boolean}) {
  const date = new Date(review.createdAt);
  return <View className="mt-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
    <View className="flex-row items-center justify-between">
      <View className="mr-3 flex-1 flex-row items-center">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft dark:bg-border-dark">
          <Text className="font-semibold text-primary-dark">{review.user.name.trim().charAt(0).toUpperCase() || 'R'}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-text dark:text-text-dark" numberOfLines={1}>{review.user.name}{own ? ' · You' : ''}</Text>
          <Text className="mt-0.5 text-xs text-text-muted dark:text-text-muted-dark">{Number.isNaN(date.getTime()) ? review.createdAt : date.toLocaleDateString()}</Text>
        </View>
      </View>
      <Rating value={review.rating} />
    </View>
    {review.comment ? <Text className="mt-3 leading-5 text-text-muted dark:text-text-muted-dark">{review.comment}</Text> : null}
  </View>;
}
