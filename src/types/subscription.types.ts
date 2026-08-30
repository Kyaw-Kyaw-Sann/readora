export type SubscriptionPlan = 'MONTHLY' | 'YEARLY';

export interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startedAt: string;
  expiresAt: string;
  cancelledAt: string | null;
}
