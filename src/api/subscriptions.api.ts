import { apiClient } from '@/api/client';
import { getResponseData } from '@/api/api-response';
import type { ApiResponse } from '@/types/api.types';
import type { Subscription, SubscriptionPlan } from '@/types/subscription.types';

export async function getCurrentSubscription() {
  return getResponseData(await apiClient.get<ApiResponse<Subscription | null>>('/api/subscriptions/me'));
}

export async function activateSubscription(plan: SubscriptionPlan) {
  return getResponseData(await apiClient.post<ApiResponse<Subscription>>('/api/subscriptions', { plan }));
}

export async function cancelSubscription() {
  return getResponseData(await apiClient.post<ApiResponse<Subscription>>('/api/subscriptions/cancel'));
}

export async function getSubscriptionHistory() {
  return getResponseData(await apiClient.get<ApiResponse<Subscription[]>>('/api/subscriptions/history'));
}
