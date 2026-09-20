import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { ReviewCard } from '@/components/reviews/review-card';
import { ReviewForm } from '@/components/reviews/review-form';
import { AppButton } from '@/components/ui/app-button';
import { ErrorState, LoadingState } from '@/components/ui/status-states';
import { useMyReview, useReviewMutation } from '@/hooks/use-reviews';
import { useAuthStore } from '@/stores/auth-store';

export function MyReview({bookId}: {bookId:number}) {
  const user = useAuthStore(state=>state.user);
  const mine = useMyReview(bookId,user?.id ?? 0,!!user?.emailVerified);
  const mutation = useReviewMutation(bookId,user?.id ?? 0);
  const [editor,setEditor] = useState<'create' | 'update' | null>(null);
  if (!user?.emailVerified) return <Text className="mt-4 text-text-muted dark:text-text-muted-dark">Verify your account to write a review.</Text>;
  if (mine.isPending) return <LoadingState label="Finding your review…" />;
  if (mine.isError) return <ErrorState title="Your review could not be checked." onRetry={()=>void mine.refetch()} />;
  const own = mine.data;
  const busy = mutation.isPending || mine.isFetching;
  const formVisible = (editor==='create' && !own) || (editor==='update' && !!own);
  const error = mutation.error ? normalizeApiError(mutation.error).message : undefined;
  const remove = ()=>Alert.alert('Delete your review?','Your rating and comment will be removed.',[
    {text:'Cancel',style:'cancel'},
    {text:'Delete',style:'destructive',onPress:()=>{
      if (!mutation.isPending && useAuthStore.getState().user?.id===user.id) mutation.mutate({type:'delete'},{onSuccess:()=>setEditor(null)});
    }},
  ]);
  return <View className="mt-5">
    <Text className="font-serif text-xl text-text dark:text-text-dark">Your review</Text>
    {formVisible ? <ReviewForm key={`${own?.id ?? 'new'}-${own?.updatedAt ?? ''}`} review={own ?? undefined} pending={busy} error={error} onCancel={()=>{setEditor(null);mutation.reset();}} onSubmit={request=>{
      if (!busy) mutation.mutate({type:own ? 'update' : 'create',request},{onSuccess:()=>setEditor(null)});
    }} /> : <>
      {own ? <><ReviewCard review={own} own /><View className="mt-3 flex-row gap-3"><AppButton className="flex-1" label="Edit" variant="outline" disabled={busy} onPress={()=>{mutation.reset();setEditor('update');}} /><AppButton className="flex-1" label="Delete" variant="ghost" loading={mutation.isPending} disabled={busy} onPress={remove} /></View></>
        : <AppButton className="mt-3" label="Write a review" disabled={busy} onPress={()=>{mutation.reset();setEditor('create');}} />}
      {error ? <><Text accessibilityLiveRegion="polite" className="mt-2 text-sm text-danger">{error}</Text><AppButton label="Refresh your review" variant="ghost" disabled={busy} onPress={()=>void mine.refetch()} /></> : null}
    </>}
    {mutation.isSuccess ? <Text accessibilityLiveRegion="polite" className="mt-2 text-sm text-success">{mutation.variables?.type==='delete' ? 'Review deleted.' : 'Review saved.'}</Text> : null}
    <Text className="mt-2 text-xs text-text-muted dark:text-text-muted-dark">One review per book. You can edit or delete your own review.</Text>
  </View>;
}
