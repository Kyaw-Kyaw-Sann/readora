import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { ErrorState, LoadingState } from '@/components/ui/status-states';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCategories } from '@/hooks/use-categories';
import { useUpdateUserInterests } from '@/hooks/use-user';
import { useAuthStore } from '@/stores/auth-store';

export default function InterestsScreen() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: categories, error, isLoading, refetch } = useCategories();
  const updateInterests = useUpdateUserInterests();
  const user = useAuthStore((state) => state.user);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const mutationError = updateInterests.error ? normalizeApiError(updateInterests.error).message : null;

  const toggleCategory = (categoryId: number) => {
    setSelectedIds((current) => current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]);
  };

  const saveInterests = () => {
    if (selectedIds.length === 0) {
      return;
    }

    updateInterests.mutate(selectedIds, {
      onSuccess: () => {
        if (user) {
          setAuthenticated(user, 'home');
        }
        router.replace('/home' as Href);
      },
    });
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView contentContainerClassName="px-6 pb-8 pt-14" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <BrandLogo size="sm" />
          <ThemeToggle />
        </View>

        <Text className="mt-9 font-serif text-3xl text-text dark:text-text-dark">What do you like to read?</Text>
        <Text className="mt-3 text-base leading-6 text-text-muted dark:text-text-muted-dark">
          Choose one or more interests to personalize your recommendations.
        </Text>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-text dark:text-text-dark">Your interests</Text>
          <Text className="text-sm text-primary">{selectedIds.length} selected</Text>
        </View>

        {isLoading ? <LoadingState label="Loading interests..." /> : null}
        {error ? <ErrorState onRetry={() => void refetch()} title={normalizeApiError(error).message} /> : null}
        {categories && categories.length === 0 ? <ErrorState onRetry={() => void refetch()} title="No interests are available right now." /> : null}

        {categories?.length ? (
          <View className="mt-4 flex-row flex-wrap gap-3">
            {categories.filter((category) => category.active).map((category) => {
              const selected = selectedIds.includes(category.id);

              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  className={`min-h-12 max-w-full justify-center rounded-xl border px-4 ${selected ? 'border-primary bg-primary dark:bg-primary' : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark'}`}
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}>
                  <Text className={`font-medium ${selected ? 'text-white' : 'text-text dark:text-text-dark'}`}>{category.name}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {mutationError ? <Text className="mt-4 text-sm text-danger">{mutationError}</Text> : null}
      </ScrollView>

      <View className="border-t border-border bg-background px-6 pb-9 pt-4 dark:border-border-dark dark:bg-background-dark">
        <AppButton disabled={selectedIds.length === 0} label="Continue" loading={updateInterests.isPending} onPress={saveInterests} />
      </View>
    </View>
  );
}
