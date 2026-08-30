import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { normalizeApiError } from '@/api/api-error';
import { useLogin } from '@/hooks/use-auth-mutations';
import { loginSchema, type LoginFormValues } from '@/schemas/login.schema';

export default function SignInScreen() {
  const { control, handleSubmit } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const loginMutation = useLogin();
  const error = loginMutation.error ? normalizeApiError(loginMutation.error).message : null;

  return (
    <AuthScreen subtitle="Sign in to continue your reading journey." title="Welcome back">
      <Controller control={control} name="email" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoCapitalize="none" autoComplete="email" autoCorrect={false} error={fieldError?.message} keyboardType="email-address" label="Email" onBlur={onBlur} onChangeText={onChange} placeholder="name@example.com" value={value} />} />
      <Controller control={control} name="password" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoComplete="password" className="mt-4" error={fieldError?.message} label="Password" onBlur={onBlur} onChangeText={onChange} placeholder="Enter your password" secureTextEntry value={value} />} />
      <AppButton className="mt-3 self-end" label="Forgot password?" onPress={() => router.push('/forgot-password' as Href)} variant="ghost" />
      {error ? <Text className="mt-3 text-sm text-danger">{error}</Text> : null}
      <AppButton className="mt-6" label="Sign In" loading={loginMutation.isPending} onPress={handleSubmit((values) => loginMutation.mutate(values))} />
      <AppButton className="mt-3" label="Create Account" onPress={() => router.push('/register' as Href)} variant="outline" />
    </AuthScreen>
  );
}
