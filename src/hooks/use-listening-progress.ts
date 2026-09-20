import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getBookAudio } from '@/api/books.api';
import { getListeningProgress, updateListeningProgress } from '@/api/progress.api';
import { queryKeys } from '@/api/query-keys';
import { useProgressAutoSave } from '@/hooks/use-progress-auto-save';
import type { UpdateListeningProgressRequest } from '@/types/progress.types';

export function useAudioAccess(bookId: number) {
  return useQuery({queryKey:queryKeys.audioAccess(bookId),queryFn:()=>getBookAudio(bookId),staleTime:0});
}
export function useListeningProgress(bookId: number) {
  return useQuery({queryKey:queryKeys.listening.detail(bookId),queryFn:()=>getListeningProgress(bookId),staleTime:0});
}
const valid = (position: UpdateListeningProgressRequest) => Number.isInteger(position.currentSeconds)
  && Number.isInteger(position.durationSeconds) && position.durationSeconds > 0
  && position.currentSeconds >= 0 && position.currentSeconds <= position.durationSeconds;
const equals = (a: UpdateListeningProgressRequest | null,b: UpdateListeningProgressRequest) =>
  a?.currentSeconds === b.currentSeconds && a.durationSeconds === b.durationSeconds;

export function useAutoSaveListeningProgress(bookId: number) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn:(position: UpdateListeningProgressRequest)=>updateListeningProgress(bookId,position),
    scope:{id:`listening-progress-${bookId}`},retry:0,
    onSuccess:progress=>{
      client.setQueryData(queryKeys.listening.detail(bookId),progress);
      void client.invalidateQueries({queryKey:queryKeys.library});
      void client.invalidateQueries({queryKey:queryKeys.listening.all,refetchType:'none'});
    },
  });
  const queue = useProgressAutoSave(mutation.mutateAsync,valid,equals,15000);
  return {...queue,isPending:mutation.isPending,error:mutation.error,isSuccess:mutation.isSuccess};
}
