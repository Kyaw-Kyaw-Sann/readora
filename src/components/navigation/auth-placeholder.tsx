import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AuthPlaceholderProps {
  actionLabel: string;
  onAction: () => void;
  subtitle: string;
  title: string;
}

export function AuthPlaceholder({ actionLabel, onAction, subtitle, title }: AuthPlaceholderProps) {
  return (
    <View className="flex-1 bg-background px-6 pb-10 pt-14 dark:bg-background-dark">
      <View className="flex-row items-center justify-between">
        <AppButton className="min-h-10 px-3" label="‹ Back" onPress={() => router.back()} variant="ghost" />
        <ThemeToggle />
      </View>
      <View className="flex-1 justify-center">
        <BrandLogo size="lg" />
        <Text className="mt-8 font-serif text-3xl text-text dark:text-text-dark">{title}</Text>
        <Text className="mt-3 text-base leading-6 text-text-muted dark:text-text-muted-dark">{subtitle}</Text>
      </View>
      <AppButton label={actionLabel} onPress={onAction} />
    </View>
  );
}
