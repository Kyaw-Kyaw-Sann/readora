import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { useRequestPasswordReset } from '@/hooks/use-auth-mutations';
import { emailSchema, type EmailFormValues } from '@/schemas/password-reset.schema';

export default function ForgotPasswordScreen() {
  const { control, handleSubmit } = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema), defaultValues: { email: '' } });
  const resetRequest = useRequestPasswordReset();
  const error = resetRequest.error ? normalizeApiError(resetRequest.error).message : null;

  return (
    <AuthScreen subtitle="We will send a reset code to your email address." title="Forgot password?">
      <Controller control={control} name="email" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoCapitalize="none" autoComplete="email" autoCorrect={false} error={fieldError?.message} keyboardType="email-address" label="Email" onBlur={onBlur} onChangeText={onChange} placeholder="name@example.com" value={value} />} />
      {error ? <Text className="mt-3 text-sm text-danger">{error}</Text> : null}
      <AppButton className="mt-6" label="Send reset code" loading={resetRequest.isPending} onPress={handleSubmit(({ email }) => resetRequest.mutate(email))} />
    </AuthScreen>
  );
}
