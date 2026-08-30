import { router, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-background px-6 pb-10 pt-16 dark:bg-background-dark">
      <View className="items-end">
        <ThemeToggle />
      </View>
      <View className="flex-1 items-center justify-center">
        <BrandLogo showWordmark size="xl" />
        <Text className="mt-5 text-center text-base text-text-muted dark:text-text-muted-dark">
          Stories that stay with you.
        </Text>
      </View>
      <View className="gap-3">
        <AppButton label="Sign In" onPress={() => router.push('/sign-in' as Href)} />
        <AppButton label="Create Account" onPress={() => router.push('/register' as Href)} variant="outline" />
      </View>
    </View>
  );
}
