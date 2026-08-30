import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { useVerifyResetOtp } from '@/hooks/use-auth-mutations';
import { otpSchema, type OtpFormValues } from '@/schemas/password-reset.schema';

export default function VerifyResetOtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { control, handleSubmit } = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema), defaultValues: { otp: '' } });
  const verifyOtp = useVerifyResetOtp();
  const error = verifyOtp.error ? normalizeApiError(verifyOtp.error).message : null;

  if (!email) {
    return <AuthScreen subtitle="Start the password reset flow again to receive a reset code." title="Reset code unavailable"><AppButton label="Back to reset password" onPress={() => router.replace('/forgot-password' as Href)} /></AuthScreen>;
  }

  return (
    <AuthScreen subtitle={`Enter the six-digit code sent to ${email}.`} title="Verify reset code">
      <Controller control={control} name="otp" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoCapitalize="none" error={fieldError?.message} keyboardType="number-pad" label="Reset code" maxLength={6} onBlur={onBlur} onChangeText={onChange} placeholder="123456" value={value} />} />
      {error ? <Text className="mt-3 text-sm text-danger">{error}</Text> : null}
      <AppButton className="mt-6" label="Verify code" loading={verifyOtp.isPending} onPress={handleSubmit(({ otp }) => verifyOtp.mutate({ email, otp }))} />
    </AuthScreen>
  );
}
