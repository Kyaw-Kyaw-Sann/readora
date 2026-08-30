import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { useResetPassword } from '@/hooks/use-auth-mutations';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schemas/password-reset.schema';

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email?: string; otp?: string }>();
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { confirmPassword: '', newPassword: '' } });
  const resetMutation = useResetPassword();
  const error = resetMutation.error ? normalizeApiError(resetMutation.error).message : null;

  if (!email || !otp) {
    return <AuthScreen subtitle="Start the password reset flow again to create a new password." title="Reset session unavailable"><AppButton label="Back to reset password" onPress={() => router.replace('/forgot-password' as Href)} /></AuthScreen>;
  }

  return (
    <AuthScreen subtitle="Choose a new password for your account." title="Reset password">
      <Controller control={control} name="newPassword" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoComplete="new-password" error={fieldError?.message} label="New password" onBlur={onBlur} onChangeText={onChange} placeholder="Create a new password" secureTextEntry value={value} />} />
      <Controller control={control} name="confirmPassword" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoComplete="new-password" className="mt-4" error={fieldError?.message} label="Confirm new password" onBlur={onBlur} onChangeText={onChange} placeholder="Confirm your new password" secureTextEntry value={value} />} />
      {error ? <Text className="mt-3 text-sm text-danger">{error}</Text> : null}
      <AppButton className="mt-6" label="Reset password" loading={resetMutation.isPending} onPress={handleSubmit(({ newPassword }) => resetMutation.mutate({ email, newPassword, otp }))} />
    </AuthScreen>
  );
}
