import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { useRegister } from '@/hooks/use-auth-mutations';
import { registerSchema, type RegisterFormValues } from '@/schemas/register.schema';

export default function RegisterScreen() {
  const { control, handleSubmit } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { confirmPassword: '', email: '', name: '', password: '' } });
  const registerMutation = useRegister();
  const error = registerMutation.error ? normalizeApiError(registerMutation.error).message : null;

  return (
    <AuthScreen subtitle="Create an account and discover stories picked for you." title="Create your account">
      <Controller control={control} name="name" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoComplete="name" error={fieldError?.message} label="Name" onBlur={onBlur} onChangeText={onChange} placeholder="Your name" value={value} />} />
      <Controller control={control} name="email" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoCapitalize="none" autoComplete="email" autoCorrect={false} className="mt-4" error={fieldError?.message} keyboardType="email-address" label="Email" onBlur={onBlur} onChangeText={onChange} placeholder="name@example.com" value={value} />} />
      <Controller control={control} name="password" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoComplete="new-password" className="mt-4" error={fieldError?.message} label="Password" onBlur={onBlur} onChangeText={onChange} placeholder="Create a password" secureTextEntry value={value} />} />
      <Controller control={control} name="confirmPassword" render={({ field: { onBlur, onChange, value }, fieldState: { error: fieldError } }) => <AppTextInput autoComplete="new-password" className="mt-4" error={fieldError?.message} label="Confirm password" onBlur={onBlur} onChangeText={onChange} placeholder="Confirm your password" secureTextEntry value={value} />} />
      {error ? <Text className="mt-3 text-sm text-danger">{error}</Text> : null}
      <AppButton className="mt-6" label="Create Account" loading={registerMutation.isPending} onPress={handleSubmit((values) => registerMutation.mutate({ email: values.email, name: values.name, password: values.password }))} />
      <AppButton className="mt-3" label="Already have an account? Sign In" onPress={() => router.replace('/sign-in' as Href)} variant="outline" />
    </AuthScreen>
  );
}
