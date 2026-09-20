import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { changePassword } from '@/api/users.api';
import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/status-states';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCategories } from '@/hooks/use-categories';
import { useLogout } from '@/hooks/use-session';
import { useCurrentSubscription } from '@/hooks/use-subscription';
import { useCurrentUser, useUpdateCurrentUser, useUpdateUserInterests, useUserInterests } from '@/hooks/use-user';
import { passwordSchema, profileSchema, type PasswordFormValues, type ProfileFormValues } from '@/schemas/account.schema';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthUser } from '@/types/auth.types';
import type { Category } from '@/types/category.types';

const card = 'gap-4 rounded-3xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark';
const heading = 'font-serif text-2xl text-text dark:text-text-dark';
const muted = 'text-sm text-text-muted dark:text-text-muted-dark';
function message(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Please try again.'; }

function ProfileEditor({ user, onClose }: { user: AuthUser; onClose: () => void }) {
  const mutation = useUpdateCurrentUser();
  const { control, handleSubmit } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, profileImageUrl: user.profileImageUrl ?? '' } });
  return <View className="gap-4">
    <Controller control={control} name="name" render={({ field, fieldState }) => <AppTextInput label="Name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} editable={!mutation.isPending} maxLength={100} autoComplete="name" />} />
    <Controller control={control} name="profileImageUrl" render={({ field, fieldState }) => <AppTextInput label="Profile image URL (optional)" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} editable={!mutation.isPending} autoCapitalize="none" autoCorrect={false} keyboardType="url" />} />
    <Text className={muted}>Paste an image URL, or leave it blank to remove your image. Photo upload is not supported by the backend.</Text>
    {mutation.isError && <Text accessibilityRole="alert" className="text-danger">{message(mutation.error)}</Text>}
    <AppButton label="Save profile" loading={mutation.isPending} onPress={handleSubmit((values) => mutation.mutate({ name: values.name, profileImageUrl: values.profileImageUrl || null }, { onSuccess: onClose }))} />
    <AppButton label="Cancel" variant="ghost" disabled={mutation.isPending} onPress={onClose} />
  </View>;
}

function PasswordEditor() {
  const [saved, setSaved] = useState(false);
  const mutation = useMutation({ mutationFn: ({ currentPassword, newPassword }: PasswordFormValues) => changePassword(currentPassword, newPassword), gcTime: 0, retry: false });
  const { control, handleSubmit, reset } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  return <View className="gap-4">
    {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((name) => <Controller key={name} control={control} name={name} render={({ field, fieldState }) => <AppTextInput label={{ currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password' }[name]} value={field.value} onChangeText={(value) => { setSaved(false); field.onChange(value); }} onBlur={field.onBlur} error={fieldState.error?.message} secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!mutation.isPending} autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} />} />)}
    {mutation.isError && <Text accessibilityRole="alert" className="text-danger">{message(mutation.error)}</Text>}
    {saved && <Text accessibilityRole="alert" className="text-success">Password changed successfully.</Text>}
    <AppButton label="Change password" loading={mutation.isPending} onPress={handleSubmit((values) => { setSaved(false); mutation.mutate(values, { onSuccess: () => { reset(); mutation.reset(); setSaved(true); } }); })} />
  </View>;
}

function InterestsEditor({ interests, onClose }: { interests: Category[]; onClose: () => void }) {
  const categories = useCategories();
  const mutation = useUpdateUserInterests();
  const [selected, setSelected] = useState(interests.map((category) => category.id));
  if (categories.isPending) return <LoadingState label="Loading categories..." />;
  if (categories.isError) return <ErrorState title={message(categories.error)} onRetry={() => void categories.refetch()} />;
  const active = categories.data.filter((category) => category.active);
  const validIds = selected.filter((id) => active.some((category) => category.id === id));
  return <View className="gap-4">
    <Text className={muted}>Choose at least one reading interest.</Text>
    {!active.length && <EmptyState title="No interests available" />}
    <View className="flex-row flex-wrap gap-2">{active.map((category) => <Pressable key={category.id} accessibilityRole="button" accessibilityState={{ selected: selected.includes(category.id), disabled: mutation.isPending }} disabled={mutation.isPending} className={`rounded-full border px-4 py-3 ${selected.includes(category.id) ? 'border-primary bg-primary-soft' : 'border-border dark:border-border-dark'}`} onPress={() => setSelected((ids) => ids.includes(category.id) ? ids.filter((id) => id !== category.id) : [...ids, category.id])}><Text className={selected.includes(category.id) ? 'text-primary-dark' : 'text-text dark:text-text-dark'}>{category.name}</Text></Pressable>)}</View>
    {mutation.isError && <Text accessibilityRole="alert" className="text-danger">{message(mutation.error)}</Text>}
    <AppButton label="Save interests" disabled={!validIds.length} loading={mutation.isPending} onPress={() => mutation.mutate(validIds, { onSuccess: onClose })} />
    <AppButton label="Cancel" variant="ghost" disabled={mutation.isPending} onPress={onClose} />
  </View>;
}

function Avatar({ user }: { user: AuthUser }) {
  const [failed, setFailed] = useState(false);
  return <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
    {user.profileImageUrl && !failed ? <Image source={{ uri: user.profileImageUrl }} style={{ width: 80, height: 80 }} contentFit="cover" accessibilityLabel="Profile image" onError={() => setFailed(true)} /> : <Text className="text-3xl font-semibold text-primary-dark">{user.name.trim().charAt(0).toUpperCase() || '?'}</Text>}
  </View>;
}

export default function ProfileTab() {
  const profile = useCurrentUser();
  const interests = useUserInterests();
  const subscription = useCurrentSubscription();
  const logout = useLogout();
  const [editing, setEditing] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const user = profile.data;
  useEffect(() => {
    const auth = useAuthStore.getState();
    if (user && auth.status === 'authenticated' && auth.user?.id === user.id) auth.updateUser(user);
  }, [user]);
  const refresh = () => Promise.all([profile.refetch(), interests.refetch(), subscription.refetch()]);
  return <SafeAreaView edges={['top']} className="flex-1 bg-background dark:bg-background-dark">
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={profile.isRefetching || interests.isRefetching || subscription.isRefetching} onRefresh={() => void refresh()} tintColor="#D99113" colors={['#D99113']} />}>
        <View className="flex-row items-center justify-between"><Text className="font-serif text-3xl text-text dark:text-text-dark">Your account</Text><ThemeToggle /></View>
        {profile.isPending ? <LoadingState label="Loading profile..." /> : profile.isError ? <ErrorState title={message(profile.error)} onRetry={() => void profile.refetch()} /> : user ? <>
          <View className={card}>
            <View className="flex-row items-center gap-4"><Avatar key={user.profileImageUrl} user={user} /><View className="flex-1 gap-1"><Text className={heading}>{user.name}</Text><Text className={muted}>{user.email}</Text><Text className={muted}>{user.provider === 'GOOGLE' ? 'Google account' : 'Email account'} · {user.emailVerified ? 'Verified' : 'Not verified'}</Text></View></View>
            {editing ? <ProfileEditor user={user} onClose={() => setEditing(false)} /> : <AppButton label="Edit profile" variant="outline" onPress={() => setEditing(true)} />}
          </View>
          <View className={card}><Text className={heading}>Reading interests</Text>
            {interests.isPending ? <LoadingState /> : interests.isError ? <ErrorState title={message(interests.error)} onRetry={() => void interests.refetch()} /> : editingInterests ? <InterestsEditor interests={interests.data} onClose={() => setEditingInterests(false)} /> : <>
              {interests.data.length ? <View className="flex-row flex-wrap gap-2">{interests.data.map((category) => <View key={category.id} className="rounded-full bg-primary-soft px-4 py-2"><Text className="text-primary-dark">{category.name}</Text></View>)}</View> : <Text className={muted}>No reading interests selected.</Text>}
              <AppButton label="Update interests" variant="outline" onPress={() => setEditingInterests(true)} />
            </>}
          </View>
          <View className={card}><Text className={heading}>Subscription</Text>
            {subscription.isPending ? <LoadingState /> : subscription.isError ? <ErrorState title={message(subscription.error)} onRetry={() => void subscription.refetch()} /> : subscription.data ? <><Text className="font-semibold text-primary-dark dark:text-primary">{subscription.data.plan === 'MONTHLY' ? 'Monthly' : 'Yearly'} Premium · {subscription.data.status}</Text><Text className={muted}>Expires: {new Date(subscription.data.expiresAt).toLocaleDateString()}</Text></> : <Text className={muted}>{user.subscriptionStatus === 'CANCELLED' ? 'Subscription cancelled' : user.subscriptionStatus === 'EXPIRED' ? 'Subscription expired' : 'No active Premium subscription'}</Text>}
            <AppButton label="Manage Premium" variant="outline" onPress={() => router.push('/premium')} />
          </View>
          <View className={card}><Text className={heading}>Account security</Text>
            {user.provider === 'LOCAL' ? <><AppButton label={showPassword ? 'Close password form' : 'Change password'} variant="outline" onPress={() => setShowPassword((value) => !value)} />{showPassword && <PasswordEditor />}</> : <Text className={muted}>This account uses Google sign-in. Manage your password through Google.</Text>}
          </View>
        </> : <EmptyState title="Profile unavailable" />}
        {logout.isError && <Text accessibilityRole="alert" className="text-danger">Could not finish secure sign-out. Please retry. {message(logout.error)}</Text>}
        <AppButton label="Log out" variant="outline" loading={logout.isPending} onPress={() => Alert.alert('Log out?', 'You can sign in again to access your library.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() }])} />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
