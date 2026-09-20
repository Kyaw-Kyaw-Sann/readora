import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-error';
import { PremiumBadge } from '@/components/books/premium-badge';
import { AudioSeekBar } from '@/components/player/audio-seek-bar';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { colors } from '@/constants/theme';
import { useBookAudioPlayer } from '@/hooks/use-book-audio-player';
import { useAudioAccess, useAutoSaveListeningProgress, useListeningProgress } from '@/hooks/use-listening-progress';
import { formatAudioTime, isAudioStorageUrl } from '@/lib/audio-progress';
import type { ListeningProgress } from '@/types/progress.types';

function Playback({bookId,url,progress,onRetry}: {bookId: number;url: string;progress: ListeningProgress;onRetry: ()=>void}) {
  const [initialSeconds] = useState(progress.currentSeconds);
  const [coverFailed,setCoverFailed] = useState(false);
  const save = useAutoSaveListeningProgress(bookId);
  const audio = useBookAudioPlayer(url,initialSeconds,save);
  const router = useRouter();
  const {colorScheme} = useColorScheme();
  const iconColor = colorScheme==='dark' ? colors.textDark : colors.text;
  const book = progress.book;
  const ready = audio.restored && !audio.seeking && !audio.error;
  const status = audio.status;
  return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top','bottom']}>
    <View className="flex-row items-center gap-3 px-4 py-2">
      <Pressable className="min-h-12 min-w-12 items-center justify-center" accessibilityRole="button" accessibilityLabel="Back" onPress={()=>{audio.stop();router.back();}}>
        <AppIcon name="arrow-left" color={iconColor} />
      </Pressable>
      <Text className="flex-1 font-serif text-xl text-text dark:text-text-dark">Audio Player</Text>
      <AppIcon name="headphones" color={colors.primary} />
    </View>
    <ScrollView contentContainerClassName="flex-grow items-center justify-center gap-5 px-6 py-6">
      <View className="aspect-[3/4] w-full max-w-64 overflow-hidden rounded-2xl bg-primary-soft dark:bg-surface-dark">
        {book.coverUrl && !coverFailed ? <Image source={{uri:book.coverUrl}} contentFit="cover" style={{width:'100%',height:'100%'}} accessibilityLabel={`${book.title} cover`} onError={()=>setCoverFailed(true)} />
          : <View className="flex-1 items-center justify-center gap-3"><AppIcon name="headphones" size={52} color={colors.primary} /><Text className="text-text-muted dark:text-text-muted-dark">No cover available</Text></View>}
      </View>
      {book.accessType==='PREMIUM' ? <PremiumBadge /> : <Text className="text-sm font-semibold text-primary">FREE AUDIOBOOK</Text>}
      <View className="gap-2"><Text className="text-center font-serif text-2xl text-text dark:text-text-dark">{book.title}</Text><Text className="text-center text-base text-text-muted dark:text-text-muted-dark">{book.author}</Text></View>
      <View className="w-full max-w-lg gap-2 rounded-2xl border border-border bg-surface px-4 py-4 dark:border-border-dark dark:bg-surface-dark">
        {audio.error ? <ErrorState title={audio.error} onRetry={onRetry} /> : <>
          {!audio.restored ? <LoadingState label="Loading and restoring audio…" /> : null}
          {audio.restored && status.isBuffering ? <Text accessibilityLiveRegion="polite" className="text-center text-sm text-text-muted dark:text-text-muted-dark">Buffering…</Text> : null}
          {audio.seeking && audio.restored ? <Text className="text-center text-sm text-text-muted dark:text-text-muted-dark">Seeking…</Text> : null}
          <AudioSeekBar current={status.currentTime} duration={status.duration} disabled={!ready || status.isBuffering} onSeek={seconds=>void audio.seek(seconds)} />
          <View className="flex-row justify-between"><Text className="text-sm text-text-muted dark:text-text-muted-dark">{audio.restored ? formatAudioTime(status.currentTime) : '—:—'}</Text><Text className="text-sm text-text-muted dark:text-text-muted-dark">{status.duration>0 ? formatAudioTime(status.duration) : '—:—'}</Text></View>
          <View className="mt-3 flex-row items-center gap-2">
            <AppButton className="flex-1 px-2" label="−15s" accessibilityLabel="Back 15 seconds" variant="outline" disabled={!ready || status.isBuffering} onPress={()=>void audio.seek(status.currentTime-15)} />
            <AppButton className="flex-1 px-2" label={status.playing ? 'Pause' : status.didJustFinish || status.currentTime>=status.duration ? 'Replay' : 'Play'} disabled={!ready} onPress={()=>void audio.toggle()} />
            <AppButton className="flex-1 px-2" label="+15s" accessibilityLabel="Forward 15 seconds" variant="outline" disabled={!ready || status.isBuffering} onPress={()=>void audio.seek(status.currentTime+15)} />
          </View>
        </>}
        <Text accessibilityLiveRegion="polite" className="mt-3 text-center text-sm text-text-muted dark:text-text-muted-dark">{save.isPending ? 'Saving progress…' : save.error ? 'Progress not saved' : save.hasUnsaved ? 'Auto-save pending…' : save.isSuccess ? 'Progress saved' : 'Progress saves when you listen'}</Text>
        {save.error ? <><Text className="text-center text-sm text-danger">Listening progress could not be saved.</Text><AppButton label="Retry save" loading={save.isPending} variant="ghost" onPress={()=>void save.flush()} /></> : null}
      </View>
      <Text className="text-center text-xs text-text-muted dark:text-text-muted-dark">Playback pauses when you leave this screen or put the app in the background.</Text>
    </ScrollView>
  </SafeAreaView>;
}

function PlayerSession({bookId}: {bookId: number}) {
  const access = useAudioAccess(bookId);
  const progress = useListeningProgress(bookId);
  const [attempt,setAttempt] = useState(0);
  const [retrying,setRetrying] = useState(false);
  const router = useRouter();
  const retry = ()=>{
    setRetrying(true);
    void Promise.all([access.refetch(),progress.refetch()]).then(()=>{
      setAttempt(value=>value+1);setRetrying(false);
    },()=>setRetrying(false));
  };
  const missing = access.error instanceof ApiError && access.error.status===404;
  if (retrying || access.isPending || progress.isPending || !access.isFetchedAfterMount || !progress.isFetchedAfterMount) return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark"><AppButton label="Back" variant="ghost" onPress={()=>router.back()} /><LoadingState label="Authorizing your audiobook…" /></SafeAreaView>;
  if (access.error || progress.error || !isAudioStorageUrl(access.data?.url) || !progress.data) return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
    <AppButton label="Back" variant="ghost" onPress={()=>router.back()} />
    {missing ? <><EmptyState title="Audio unavailable" description={access.error?.message} /><AppButton label="Retry" variant="outline" onPress={retry} /></> : access.error || progress.error ? <ErrorState title={access.error?.message ?? progress.error?.message} onRetry={retry} /> : <><EmptyState title="Audio unavailable" description="This book has no supported audio URL." /><AppButton label="Retry" variant="outline" onPress={retry} /></>}
  </SafeAreaView>;
  return <Playback key={`${bookId}-${attempt}`} bookId={bookId} url={access.data!.url} progress={progress.data} onRetry={retry} />;
}

export default function PlayerScreen() {
  const {bookId} = useLocalSearchParams<{bookId: string}>();
  const id = Number(bookId);
  if (!Number.isSafeInteger(id) || id<=0) return <ErrorState title="Invalid book." />;
  return <PlayerSession key={id} bookId={id} />;
}
