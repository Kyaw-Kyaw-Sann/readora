import { ActivityIndicator, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View className="items-center justify-center gap-3 py-10">
      <ActivityIndicator color="#D99113" />
      <Text className="text-sm text-text-muted dark:text-text-muted-dark">{label}</Text>
    </View>
  );
}

export function EmptyState({ description, title }: { description?: string; title: string }) {
  return (
    <View className="items-center justify-center px-6 py-10">
      <Text className="text-center font-serif text-xl text-text dark:text-text-dark">{title}</Text>
      {description ? <Text className="mt-2 text-center text-sm text-text-muted dark:text-text-muted-dark">{description}</Text> : null}
    </View>
  );
}

export function ErrorState({ onRetry, title = 'Something went wrong.' }: { onRetry?: () => void; title?: string }) {
  return (
    <View className="items-center justify-center px-6 py-10">
      <Text className="text-center font-serif text-xl text-text dark:text-text-dark">{title}</Text>
      {onRetry ? <AppButton className="mt-4" label="Try again" onPress={onRetry} variant="outline" /> : null}
    </View>
  );
}
