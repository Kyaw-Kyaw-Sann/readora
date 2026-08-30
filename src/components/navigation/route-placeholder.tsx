import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface RoutePlaceholderProps {
  actionLabel?: string;
  onAction?: () => void;
  subtitle: string;
  title: string;
}

export function RoutePlaceholder({ actionLabel, onAction, subtitle, title }: RoutePlaceholderProps) {
  return (
    <View className="flex-1 bg-background px-6 pb-10 pt-14 dark:bg-background-dark">
      <View className="flex-row items-center justify-between">
        <AppButton className="min-h-10 px-3" label="‹ Back" onPress={() => router.back()} variant="ghost" />
        <ThemeToggle />
      </View>
      <View className="flex-1 items-center justify-center">
        <BrandLogo size="lg" />
        <Text className="mt-7 text-center font-serif text-3xl text-text dark:text-text-dark">{title}</Text>
        <Text className="mt-3 max-w-xs text-center text-base leading-6 text-text-muted dark:text-text-muted-dark">{subtitle}</Text>
      </View>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
