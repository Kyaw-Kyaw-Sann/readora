import { Text, View } from 'react-native';

import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface TabPlaceholderProps {
  actionLabel?: string;
  onAction?: () => void;
  title: string;
}

export function TabPlaceholder({ actionLabel, onAction, title }: TabPlaceholderProps) {
  return (
    <View className="flex-1 bg-background px-5 pt-14 dark:bg-background-dark">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <BrandLogo size="sm" />
          <Text className="font-serif text-2xl text-primary">Readora</Text>
        </View>
        <ThemeToggle />
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="font-serif text-3xl text-text dark:text-text-dark">{title}</Text>
        <Text className="mt-3 max-w-xs text-center text-base text-text-muted dark:text-text-muted-dark">
          Navigation is ready. This screen will receive its feature UI in the next phases.
        </Text>
        {actionLabel && onAction ? <AppButton className="mt-7" label={actionLabel} onPress={onAction} /> : null}
      </View>
    </View>
  );
}
