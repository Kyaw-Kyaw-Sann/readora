import { ScrollView, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { BookCard } from '@/components/books/book-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark" contentContainerClassName="px-5 pb-12 pt-16">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-serif text-4xl text-primary">Readora</Text>
          <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">
            Design system preview
          </Text>
        </View>
        <ThemeToggle />
      </View>

      <SectionHeader className="mt-10" title="Buttons" />
      <AppButton className="mt-3" label="Continue reading" onPress={() => undefined} />
      <AppButton className="mt-3" label="Explore library" onPress={() => undefined} variant="outline" />

      <SectionHeader className="mt-10" title="Book card" />
      <BookCard
        author="Matt Haig"
        className="mt-3"
        coverUrl="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80"
        premium
        rating={4.6}
        title="The Midnight Library"
      />

      <SectionHeader className="mt-10" title="Reading progress" />
      <View className="mt-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
        <Text className="font-medium text-text dark:text-text-dark">The Light Between Waves</Text>
        <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">Chapter 3 of 12</Text>
        <ProgressBar className="mt-4" value={42} />
      </View>
    </ScrollView>
  );
}
