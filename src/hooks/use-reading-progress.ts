import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getBookPdf } from '@/api/books.api';
import { getReadingProgress, updateReadingProgress } from '@/api/progress.api';
import { queryKeys } from '@/api/query-keys';
import { useProgressAutoSave } from '@/hooks/use-progress-auto-save';
import type { UpdateReadingProgressRequest } from '@/types/progress.types';

export function usePdfAccess(bookId: number) {
  return useQuery({ queryKey: queryKeys.pdfAccess(bookId), queryFn: () => getBookPdf(bookId), staleTime: 0 });
}
export function useReadingProgress(bookId: number) {
  return useQuery({ queryKey: queryKeys.reading.detail(bookId), queryFn: () => getReadingProgress(bookId), staleTime: 0 });
}
const valid = (position: UpdateReadingProgressRequest) => Number.isInteger(position.currentPage)
  && Number.isInteger(position.totalPages) && position.currentPage >= 1 && position.currentPage <= position.totalPages;
const equals = (a: UpdateReadingProgressRequest | null, b: UpdateReadingProgressRequest) =>
  a?.currentPage === b.currentPage && a.totalPages === b.totalPages;

export function useAutoSaveReadingProgress(bookId: number) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (position: UpdateReadingProgressRequest) => updateReadingProgress(bookId, position),
    scope: { id: `reading-progress-${bookId}` }, retry: 0,
    onSuccess: (progress) => {
      queryClient.setQueryData(queryKeys.reading.detail(bookId), progress);
      void queryClient.invalidateQueries({ queryKey: queryKeys.library });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reading.all, refetchType: 'none' });
    },
  });
  const queue = useProgressAutoSave(mutation.mutateAsync,valid,equals);
  return {...queue,isPending:mutation.isPending,error:mutation.error,isSuccess:mutation.isSuccess};
}
