import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { activateSubscription, cancelSubscription, getCurrentSubscription, getSubscriptionHistory } from '@/api/subscriptions.api';
import type { SubscriptionPlan } from '@/types/subscription.types';

export function useCurrentSubscription(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.subscription.current, queryFn: getCurrentSubscription });
}

export function useSubscriptionHistory(enabled = true) {
  return useQuery({ enabled, queryKey: queryKeys.subscription.history, queryFn: getSubscriptionHistory });
}

export function useActivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: SubscriptionPlan) => activateSubscription(plan),
    onSuccess: (subscription) => {
      queryClient.setQueryData(queryKeys.subscription.current, subscription);
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.history });
      queryClient.invalidateQueries({ queryKey: queryKeys.library });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (subscription) => {
      queryClient.setQueryData(queryKeys.subscription.current, subscription);
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.history });
      queryClient.invalidateQueries({ queryKey: queryKeys.library });
    },
  });
}
