import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { normalizeApiError } from '@/api/api-error';
import { PremiumBadge } from '@/components/books/premium-badge';
import { AppButton } from '@/components/ui/app-button';
import { AppIcon } from '@/components/ui/app-icon';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { colors } from '@/constants/theme';
import { useCurrentSubscription, useSubscriptionActions, useSubscriptionHistory } from '@/hooks/use-subscription';
import { useAuthStore } from '@/stores/auth-store';
import type { Subscription, SubscriptionPlan } from '@/types/subscription.types';

function dateLabel(value:string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function SubscriptionCard({subscription}: {subscription:Subscription}) {
  return <View className="mt-3 gap-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
    <View className="flex-row justify-between gap-3"><Text className="font-semibold text-text dark:text-text-dark">{subscription.plan==='MONTHLY' ? 'Monthly' : 'Yearly'} plan</Text><Text className="text-sm font-semibold text-primary">{subscription.status}</Text></View>
    <Text className="text-sm text-text-muted dark:text-text-muted-dark">Started: {dateLabel(subscription.startedAt)}</Text>
    <Text className="text-sm text-text-muted dark:text-text-muted-dark">Expires: {dateLabel(subscription.expiresAt)}</Text>
    {subscription.cancelledAt ? <Text className="text-sm text-text-muted dark:text-text-muted-dark">Cancelled: {dateLabel(subscription.cancelledAt)}</Text> : null}
  </View>;
}

export default function PremiumScreen() {
  const router = useRouter();
  const {colorScheme} = useColorScheme();
  const user = useAuthStore(state=>state.user);
  const current = useCurrentSubscription(!!user?.emailVerified);
  const history = useSubscriptionHistory(!!user?.emailVerified);
  const actions = useSubscriptionActions();
  const [plan,setPlan] = useState<SubscriptionPlan>('MONTHLY');
  const [checkout,setCheckout] = useState(false);
  const active = !!current.data;
  const busy = actions.activate.isPending || actions.cancel.isPending || actions.refreshing;
  const canCheckout = !!user?.emailVerified && current.isSuccess && !current.isFetching && !active && !busy;
  const mutationError = actions.activate.error ?? actions.cancel.error;
  const begin = ()=>{actions.activate.reset();actions.cancel.reset();setCheckout(true);};
  const activate = ()=>{
    if (!canCheckout) return;
    actions.activate.mutate(plan,{onSuccess:()=>setCheckout(false)});
  };
  const cancel = ()=>{
    if (!active || busy || current.isFetching) return;
    Alert.alert('Cancel Premium?','Premium access ends immediately. This is a mock subscription, so there are no charges or refunds.',[
      {text:'Keep Premium',style:'cancel'},
      {text:'Cancel subscription',style:'destructive',onPress:()=>{
        if (useAuthStore.getState().user?.id!==user?.id) return;
        actions.activate.reset();actions.cancel.reset();actions.cancel.mutate();
      }},
    ]);
  };
  return <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top','bottom']}>
    <View className="flex-row items-center gap-3 px-4 py-2"><Pressable accessibilityLabel="Back" accessibilityRole="button" disabled={busy} className="min-h-12 min-w-12 items-center justify-center" onPress={()=>router.back()}><AppIcon name="arrow-left" color={colorScheme==='dark' ? colors.textDark : colors.text} /></Pressable><Text className="flex-1 font-serif text-2xl text-text dark:text-text-dark">Readora Premium</Text><ThemeToggle /></View>
    <FlatList data={history.isError ? [] : history.data ?? []} keyExtractor={item=>String(item.id)} contentContainerClassName="px-5 pb-8"
      renderItem={({item})=><SubscriptionCard subscription={item} />}
      ListHeaderComponent={<View>
        <View className="mt-4 gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-5 dark:bg-surface-dark"><PremiumBadge /><Text className="font-serif text-3xl text-text dark:text-text-dark">More stories. More discovery.</Text><Text className="leading-6 text-text-muted dark:text-text-muted-dark">Access published Premium books and their available PDFs and audiobooks.</Text><Text className="font-semibold text-primary-dark dark:text-primary">DEMO ONLY · No real payment or card details</Text></View>
        <Text className="mt-6 font-serif text-xl text-text dark:text-text-dark">Current subscription</Text>
        {!user?.emailVerified ? <EmptyState title="Verified account required" description="Verify your account before activating Premium." /> : current.isPending ? <LoadingState label="Loading subscription…" /> : current.isError ? <ErrorState title={current.error.message} onRetry={()=>void current.refetch()} /> : current.data ? <><SubscriptionCard subscription={current.data} /><AppButton className="mt-3" label="Cancel subscription" variant="outline" disabled={busy || current.isFetching} loading={actions.cancel.isPending} onPress={cancel} /></> : <EmptyState title="No active Premium subscription" description="Previous cancelled or expired subscriptions are listed below." />}
        {!active && user?.emailVerified ? <View className="mt-5 gap-3">
          <Text className="font-serif text-xl text-text dark:text-text-dark">{checkout ? 'Mock checkout' : 'Choose your plan'}</Text>
          {!checkout ? <>{(['MONTHLY','YEARLY'] as const).map(value=><Pressable key={value} accessibilityRole="radio" accessibilityState={{checked:plan===value,disabled:!canCheckout}} disabled={!canCheckout} onPress={()=>setPlan(value)} className={`gap-2 rounded-2xl border p-4 ${plan===value ? 'border-primary bg-primary-soft dark:bg-surface-dark' : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark'}`}><Text className="text-lg font-semibold text-text dark:text-text-dark">{value==='MONTHLY' ? 'Monthly · 1 month' : 'Yearly · 1 year'}</Text><Text className="text-sm text-text-muted dark:text-text-muted-dark">Mock activation · No charge</Text></Pressable>)}<AppButton label="Continue to mock checkout" disabled={!canCheckout} onPress={begin} /></> : <View className="gap-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark"><Text className="text-lg font-semibold text-text dark:text-text-dark">{plan==='MONTHLY' ? 'Monthly' : 'Yearly'} Premium</Text><Text className="leading-6 text-text-muted dark:text-text-muted-dark">Confirm to activate a demo subscription. No payment is collected. The backend sets your start and expiry dates. Cancellation ends access immediately.</Text><AppButton label="Confirm mock activation" disabled={!canCheckout} loading={actions.activate.isPending} onPress={activate} /><AppButton label="Change plan" variant="ghost" disabled={busy} onPress={()=>{setCheckout(false);actions.activate.reset();}} /></View>}
        </View> : null}
        {mutationError ? <Text accessibilityLiveRegion="polite" className="mt-3 text-sm text-danger">{normalizeApiError(mutationError).message}</Text> : null}
        {actions.activate.isSuccess ? <Text className="mt-3 text-sm text-success">Mock subscription activated. No payment was charged.</Text> : actions.cancel.isSuccess ? <Text className="mt-3 text-sm text-success">Subscription cancelled. Premium access has ended.</Text> : null}
        {actions.refreshError ? <View className="mt-3 gap-2"><Text accessibilityLiveRegion="polite" className="text-sm text-danger">{actions.refreshError}</Text><AppButton label="Retry account refresh" variant="outline" loading={actions.refreshing} onPress={()=>void actions.refresh()} /></View> : null}
        <Text className="mt-7 font-serif text-xl text-text dark:text-text-dark">Subscription history</Text>
      </View>}
      ListEmptyComponent={!user?.emailVerified ? null : history.isPending ? <LoadingState label="Loading history…" /> : history.isError ? <ErrorState title={history.error.message} onRetry={()=>void history.refetch()} /> : <EmptyState title="No subscription history" description="Your demo activations and cancellations will appear here." />}
      ListFooterComponent={<AppButton className="mt-5" label="Refresh account & subscriptions" variant="ghost" loading={actions.refreshing} disabled={busy} onPress={()=>void actions.refresh()} />} />
  </SafeAreaView>;
}
