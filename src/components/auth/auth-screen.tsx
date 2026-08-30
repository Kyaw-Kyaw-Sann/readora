import { router } from 'expo-router';
import { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AuthScreenProps extends PropsWithChildren {
  subtitle: string;
  title: string;
}

export function AuthScreen({ children, subtitle, title }: AuthScreenProps) {
  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="min-h-full px-6 pb-10 pt-14" keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center justify-between">
          <AppButton className="min-h-10 px-3" label="‹ Back" onPress={() => router.back()} variant="ghost" />
          <ThemeToggle />
        </View>
        <View className="mt-8 items-center">
          <BrandLogo size="lg" />
        </View>
        <Text className="mt-8 font-serif text-3xl text-text dark:text-text-dark">{title}</Text>
        <Text className="mt-2 text-base leading-6 text-text-muted dark:text-text-muted-dark">{subtitle}</Text>
        <View className="mt-8">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
