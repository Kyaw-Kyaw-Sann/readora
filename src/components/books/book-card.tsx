import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { PremiumBadge } from '@/components/books/premium-badge';
import { Rating } from '@/components/books/rating';

interface BookCardProps {
  author: string;
  className?: string;
  coverUrl?: string | null;
  premium?: boolean;
  rating?: number;
  title: string;
  onPress?: () => void;
}

export function BookCard({
  author,
  className,
  coverUrl,
  onPress,
  premium = false,
  rating,
  title,
}: BookCardProps) {
  return (
    <Pressable
      accessibilityHint={onPress ? `Opens ${title}` : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      className={`w-36 ${className ?? ''}`}
      disabled={!onPress}
      onPress={onPress}
    >
      <View className="relative aspect-[3/4] overflow-hidden rounded-xl bg-primary-soft dark:bg-surface-dark">
        {coverUrl ? (
          <Image
            accessibilityLabel={`${title} cover`}
            source={{ uri: coverUrl }}
            style={{
              width: '100%',
              height: '100%',
            }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="h-full w-full items-center justify-center px-3">
            <Text className="text-center text-sm text-primary-dark">
              No cover
            </Text>
          </View>
        )}

        {premium ? (
          <PremiumBadge className="absolute left-2 top-2" />
        ) : null}
      </View>

      <Text className="mt-3" numberOfLines={2}>
        <Text className="font-semibold text-text dark:text-text-dark">
          {title}
        </Text>
      </Text>

      <Text
        className="mt-1 text-sm text-text-muted dark:text-text-muted-dark"
        numberOfLines={1}
      >
        {author}
      </Text>

      {rating ? (
        <Rating className="mt-2" value={rating} />
      ) : null}
    </Pressable>
  );
}
