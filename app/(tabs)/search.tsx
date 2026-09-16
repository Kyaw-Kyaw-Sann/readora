import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';

import { BookCard } from '@/components/books/book-card';
import { BrandLogo } from '@/components/brand/brand-logo';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { colors } from '@/constants/theme';
import { useInfiniteBooks } from '@/hooks/use-books';
import { useCategories } from '@/hooks/use-categories';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { Book, BookAccessType, BookSort } from '@/types/book.types';

const PAGE_SIZE = 12;

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-11 items-center justify-center rounded-full border px-4 ${active ? 'border-primary bg-primary' : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark'}`}
      onPress={onPress}>
      <Text className={`font-medium ${active ? 'text-white' : 'text-text dark:text-text-dark'}`}>{label}</Text>
    </Pressable>
  );
}

function SearchHeader({
  accessType,
  categoryId,
  categories,
  onAccessTypeChange,
  onCategoryChange,
  onClear,
  onSearchChange,
  onSortChange,
  search,
  sort,
}: {
  accessType?: BookAccessType;
  categoryId?: number;
  categories: { id: number; name: string }[];
  onAccessTypeChange: (value?: BookAccessType) => void;
  onCategoryChange: (value?: number) => void;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: BookSort) => void;
  search: string;
  sort: BookSort;
}) {
  const hasFilters = Boolean(search.trim() || categoryId || accessType || sort !== 'NEWEST');

  return (
    <View className="px-5 pb-5 pt-14">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <BrandLogo size="md" />
          <View className="ml-3">
            <Text className="font-serif text-3xl text-primary">Readora</Text>
            <Text className="text-xs text-text-muted dark:text-text-muted-dark">Discover your next story.</Text>
          </View>
        </View>
        <ThemeToggle />
      </View>

      <View className="mt-6 flex-row items-center rounded-2xl border border-border bg-surface px-4 dark:border-border-dark dark:bg-surface-dark">
        <AppIcon color={colors.textMuted} name="search" size={22} />
        <TextInput
          accessibilityLabel="Search books and authors"
          autoCapitalize="none"
          autoCorrect={false}
          className="h-14 flex-1 px-3 text-base text-text dark:text-text-dark"
          onChangeText={onSearchChange}
          placeholder="Search books or authors..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          value={search}
        />
        {search ? (
          <Pressable accessibilityLabel="Clear search" className="h-9 w-9 items-center justify-center" onPress={() => onSearchChange('')}>
            <Text className="text-2xl text-text-muted dark:text-text-muted-dark">×</Text>
          </Pressable>
        ) : null}
      </View>

      <Text className="mt-6 text-sm font-semibold text-text dark:text-text-dark">Browse by category</Text>
      <FlatList
        className="mt-3"
        contentContainerClassName="gap-2 pr-5"
        data={categories}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <FilterChip active={categoryId === item.id} label={item.name} onPress={() => onCategoryChange(categoryId === item.id ? undefined : item.id)} />}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={<FilterChip active={!categoryId} label="All" onPress={() => onCategoryChange(undefined)} />}
      />

      <View className="mt-4 flex-row flex-wrap gap-2">
        <FilterChip active={accessType === 'FREE'} label="Free" onPress={() => onAccessTypeChange(accessType === 'FREE' ? undefined : 'FREE')} />
        <FilterChip active={accessType === 'PREMIUM'} label="Premium" onPress={() => onAccessTypeChange(accessType === 'PREMIUM' ? undefined : 'PREMIUM')} />
        <FilterChip active={sort === 'NEWEST'} label="Newest" onPress={() => onSortChange('NEWEST')} />
        <FilterChip active={sort === 'POPULAR'} label="Popular" onPress={() => onSortChange('POPULAR')} />
        {hasFilters ? (
          <Pressable accessibilityRole="button" className="min-h-11 justify-center px-2" onPress={onClear}>
            <Text className="font-semibold text-primary">Clear all</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function SearchTab() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number>();
  const [accessType, setAccessType] = useState<BookAccessType>();
  const [sort, setSort] = useState<BookSort>('NEWEST');
  const debouncedSearch = useDebouncedValue(search.trim());
  const categoriesQuery = useCategories();
  const params = useMemo(() => ({
    accessType,
    categoryId,
    search: debouncedSearch || undefined,
    size: PAGE_SIZE,
    sort,
  }), [accessType, categoryId, debouncedSearch, sort]);
  const booksQuery = useInfiniteBooks(params);
  const books = booksQuery.data?.pages.flatMap((page) => page.content) ?? [];

  const clearFilters = () => {
    setSearch('');
    setCategoryId(undefined);
    setAccessType(undefined);
    setSort('NEWEST');
  };

  const refresh = () => {
    void Promise.all([booksQuery.refetch(), categoriesQuery.refetch()]);
  };

  const renderBook = ({ item }: { item: Book }) => (
    <View className="mb-7 flex-1 items-center">
      <BookCard
        author={item.author}
        coverUrl={item.coverUrl}
        onPress={() => router.push(`/book/${item.id}` as Href)}
        premium={item.accessType === 'PREMIUM'}
        title={item.title}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <FlatList
        columnWrapperClassName="gap-4 px-5"
        contentContainerClassName="pb-10"
        data={books}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          booksQuery.isLoading ? <LoadingState label="Searching books..." /> : booksQuery.isError ? (
            <ErrorState onRetry={() => void booksQuery.refetch()} title="Books could not be loaded." />
          ) : (
            <EmptyState description="Try a different title, author, or filter." title="No books found" />
          )
        }
        ListFooterComponent={
          books.length && booksQuery.hasNextPage ? (
            <View className="px-5 pb-4">
              <AppButton label="Load more books" loading={booksQuery.isFetchingNextPage} onPress={() => void booksQuery.fetchNextPage()} variant="outline" />
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            <SearchHeader
              accessType={accessType}
              categories={(categoriesQuery.data ?? []).filter((category) => category.active)}
              categoryId={categoryId}
              onAccessTypeChange={setAccessType}
              onCategoryChange={setCategoryId}
              onClear={clearFilters}
              onSearchChange={setSearch}
              onSortChange={setSort}
              search={search}
              sort={sort}
            />
            {categoriesQuery.isError ? <ErrorState onRetry={() => void categoriesQuery.refetch()} title="Categories could not be loaded." /> : null}
            {!booksQuery.isLoading && !booksQuery.isError ? (
              <View className="mb-5 px-5">
                <Text className="font-serif text-2xl text-text dark:text-text-dark">Search Results</Text>
                <Text className="mt-1 text-sm text-text-muted dark:text-text-muted-dark">{booksQuery.data?.pages[0]?.totalElements ?? 0} books found</Text>
              </View>
            ) : null}
          </>
        }
        numColumns={2}
        refreshControl={<RefreshControl onRefresh={refresh} refreshing={booksQuery.isRefetching || categoriesQuery.isRefetching} tintColor={colors.primary} />}
        renderItem={renderBook}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
