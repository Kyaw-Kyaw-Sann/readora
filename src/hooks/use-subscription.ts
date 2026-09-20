import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { queryKeys } from '@/api/query-keys';
import { activateSubscription, cancelSubscription, getCurrentSubscription, getSubscriptionHistory } from '@/api/subscriptions.api';
import { getCurrentUser } from '@/api/users.api';
import { useAuthStore } from '@/stores/auth-store';
import type { Subscription, SubscriptionPlan } from '@/types/subscription.types';

export function useCurrentSubscription(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.subscription.current, queryFn: getCurrentSubscription, staleTime:0 });
}

export function useSubscriptionHistory(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.subscription.history, queryFn: getSubscriptionHistory, staleTime:0 });
}

export function useSubscriptionActions() {
  const queryClient = useQueryClient();
  const [refreshError,setRefreshError] = useState<string | null>(null);
  const [refreshing,setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    const userId = useAuthStore.getState().user?.id;
    setRefreshError(null);setRefreshing(true);
    const results = await Promise.allSettled([
      (async () => {
        await queryClient.cancelQueries({queryKey:queryKeys.user.current});
        await queryClient.invalidateQueries({queryKey:queryKeys.user.current,refetchType:'none'});
        const user = await queryClient.fetchQuery({queryKey:queryKeys.user.current,queryFn:getCurrentUser,staleTime:0});
        const auth = useAuthStore.getState();
        // Never resurrect a logged-out session or change another user's session.
        if (auth.status==='authenticated' && auth.user?.id===userId && user.id===userId) auth.updateUser(user);
      })(),
      ...[queryKeys.subscription.current,queryKeys.subscription.history,queryKeys.books.all,
        queryKeys.library,queryKeys.reading.all,queryKeys.listening.all].map(queryKey=>
        queryClient.invalidateQueries({queryKey},{throwOnError:true})),
    ]);
    if (results.some(result=>result.status==='rejected')) setRefreshError('Some account or library data could not refresh. Retry refresh; do not repeat checkout.');
    setRefreshing(false);
  },[queryClient]);
  const onSuccess = async (subscription:Subscription) => {
    await queryClient.cancelQueries({queryKey:queryKeys.subscription.current});
    // /me returns only active subscriptions, never the cancellation response object.
    queryClient.setQueryData(queryKeys.subscription.current,subscription.status==='ACTIVE' ? subscription : null);
    await refresh();
  };
  const onError = () => {void refresh();};
  const activate = useMutation({mutationFn:(plan:SubscriptionPlan)=>activateSubscription(plan),
    scope:{id:'subscription-change'},retry:0,onSuccess,onError});
  const cancel = useMutation({mutationFn:cancelSubscription,scope:{id:'subscription-change'},retry:0,onSuccess,onError});
  return {activate,cancel,refresh,refreshing,refreshError};
}

export function useActivateSubscription() {return useSubscriptionActions().activate;}
export function useCancelSubscription() {return useSubscriptionActions().cancel;}
