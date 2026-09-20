import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfViewer, type PdfPosition, type PdfViewerHandle } from '@/components/reader/pdf-viewer';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { colors } from '@/constants/theme';
import { useAutoSaveReadingProgress, usePdfAccess, useReadingProgress } from '@/hooks/use-reading-progress';

function ReaderDocument({ bookId, url, initialPage, title }: { bookId: number; url: string; initialPage: number; title: string }) {
  // Freeze restoration for this viewer session: successful saves must not reload the PDF.
  const [startPage] = useState(initialPage);
  const [position, setPosition] = useState<PdfPosition | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const viewer = useRef<PdfViewerHandle>(null);
  const save = useAutoSaveReadingProgress(bookId);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const background = colorScheme === 'dark' ? colors.backgroundDark : colors.background;
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (fullscreen) {setFullscreen(false); return true;}
      return false;
    });
    return () => listener.remove();
  }, [fullscreen]);
  const rendered = (value: PdfPosition) => {
    setPosition(value); setBusy(false); setError(null);
    save.schedule({ currentPage:value.currentPage, totalPages:value.totalPages });
  };
  const retry = () => {setError(null); setBusy(true); setAttempt(value => value + 1);};
  return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={fullscreen ? ['bottom'] : ['top', 'bottom']}>
    <StatusBar hidden={fullscreen} style={colorScheme === 'dark' ? 'light' : 'dark'} />
    {!fullscreen ? <View className="flex-row items-center gap-3 px-4 py-3">
      <Pressable accessibilityLabel="Back" className="min-h-12 min-w-12 items-center justify-center" onPress={() => {void save.flush(); router.back();}}>
        <AppIcon name="arrow-left" color={colorScheme === 'dark' ? colors.textDark : colors.text} />
      </Pressable>
      <Text numberOfLines={1} className="flex-1 font-serif text-xl text-text dark:text-text-dark">{title}</Text>
      <AppButton label="Full screen" variant="ghost" onPress={() => setFullscreen(true)} />
    </View> : <AppButton className="absolute right-3 top-3 z-10 bg-surface dark:bg-surface-dark" label="Exit full screen" variant="outline" onPress={() => setFullscreen(false)} />}
    <View className="flex-1">
      {!error ? <PdfViewer key={attempt} ref={viewer} url={url} initialPage={position?.currentPage ?? startPage}
        background={background} onPage={rendered} onBusy={() => setBusy(true)} onError={(message) => {setError(message);setBusy(false);}} /> : <ErrorState title={error} onRetry={retry} />}
      {busy && !error ? <View pointerEvents="none" className="absolute inset-0 items-center justify-center bg-background/80 dark:bg-background-dark/80"><ActivityIndicator color={colors.primary} /><Text className="mt-3 text-text dark:text-text-dark">Loading PDF…</Text></View> : null}
    </View>
    {!fullscreen ? <View className="gap-2 border-t border-border px-3 py-2 dark:border-border-dark">
      <View className="flex-row items-center justify-between gap-2">
        <AppButton className="flex-1 px-2" label="Previous" variant="outline" disabled={busy || !!error || !position || position.currentPage <= 1} onPress={() => viewer.current?.page((position?.currentPage ?? 1) - 1)} />
        <Text accessibilityLiveRegion="polite" className="text-sm text-text dark:text-text-dark">{position ? `${position.currentPage} / ${position.totalPages}` : '— / —'}</Text>
        <AppButton className="flex-1 px-2" label="Next" variant="outline" disabled={busy || !!error || !position || position.currentPage >= position.totalPages} onPress={() => viewer.current?.page((position?.currentPage ?? 1) + 1)} />
      </View>
      <View className="flex-row items-center justify-between">
        <AppButton label="−" accessibilityLabel="Zoom out" variant="ghost" disabled={busy || !!error || !position || position.zoom <= 1} onPress={() => viewer.current?.zoom((position?.zoom ?? 1) - 0.25)} />
        <Text className="text-sm text-text-muted dark:text-text-muted-dark">{position ? `${Math.round(position.zoom * 100)}%` : 'Fit page'} · {save.isPending ? 'Saving…' : save.error ? 'Not saved' : save.hasUnsaved ? 'Waiting to save…' : save.isSuccess ? 'Saved' : 'Auto-save'}</Text>
        <AppButton label="+" accessibilityLabel="Zoom in" variant="ghost" disabled={busy || !!error || !position || position.zoom >= 3} onPress={() => viewer.current?.zoom((position?.zoom ?? 1) + 0.25)} />
      </View>
      {save.error ? <View className="flex-row items-center justify-between"><Text className="flex-1 text-sm text-danger">Progress could not be saved.</Text><AppButton label="Retry save" variant="ghost" loading={save.isPending} onPress={() => void save.flush()} /></View> : null}
    </View> : null}
  </SafeAreaView>;
}

function ReaderSession({ bookId }: { bookId: number }) {
  const access = usePdfAccess(bookId);
  const progress = useReadingProgress(bookId);
  const router = useRouter();
  const retry = () => {void access.refetch(); void progress.refetch();};
  let validUrl = false;
  try {
    if (access.data?.url) {
      const storage = new URL(access.data.url);
      validUrl = storage.protocol === 'https:' && !storage.username && !storage.password;
    }
  } catch { /* Display missing/unsupported storage state below. */ }
  if (access.isPending || progress.isPending || access.isFetching || progress.isFetching) return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark"><LoadingState label="Opening your book…" /></SafeAreaView>;
  if (access.error || progress.error || !validUrl) return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
    <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
    {access.error || progress.error ? <ErrorState title={access.error?.message ?? progress.error?.message} onRetry={retry} /> : <EmptyState title="PDF unavailable" description="This book has no supported PDF URL. Please try another book." />}
  </SafeAreaView>;
  return <ReaderDocument bookId={bookId} url={access.data!.url} initialPage={progress.data?.currentPage ?? 1} title={progress.data?.book.title ?? 'Reader'} />;
}

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const id = Number(bookId);
  if (!Number.isSafeInteger(id) || id <= 0) return <ErrorState title="Invalid book." />;
  return <ReaderSession key={id} bookId={id} />;
}
