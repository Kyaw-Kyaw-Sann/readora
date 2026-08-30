import { useEffect } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Text } from 'react-native';

import { normalizeApiError } from '@/api/api-error';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AppButton } from '@/components/ui/app-button';
import { useResendVerification, useVerifyEmail } from '@/hooks/use-auth-mutations';
import { useAuthStore } from '@/stores/auth-store';

export default function VerifyEmailScreen() {
  const { email: emailParam, token } = useLocalSearchParams<{ email?: string; token?: string }>();
  const userEmail = useAuthStore((state) => state.user?.email);
  const email = emailParam ?? userEmail;
  const resendMutation = useResendVerification();
  const verifyMutation = useVerifyEmail();
  const error = verifyMutation.error ?? resendMutation.error;

  useEffect(() => {
    if (token && !verifyMutation.isPending && !verifyMutation.isSuccess) {
      verifyMutation.mutate(token);
    }
  }, [token, verifyMutation]);

  return (
    <AuthScreen subtitle={email ? `We sent a verification link to ${email}.` : 'Check your inbox and verify your email to continue.'} title="Verify your email">
      {verifyMutation.isPending ? <Text className="text-sm text-text-muted dark:text-text-muted-dark">Verifying your email...</Text> : null}
      {verifyMutation.isSuccess ? <Text className="text-sm text-success">Email verified. Redirecting you now...</Text> : null}
      {resendMutation.isSuccess ? <Text className="text-sm text-success">Verification email sent successfully.</Text> : null}
      {error ? <Text className="mt-3 text-sm text-danger">{normalizeApiError(error).message}</Text> : null}
      {email ? <AppButton className="mt-6" label="Resend verification email" loading={resendMutation.isPending} onPress={() => resendMutation.mutate(email)} variant="outline" /> : null}
      <AppButton className="mt-3" label="Back to Sign In" onPress={() => router.replace('/sign-in' as Href)} variant="ghost" />
    </AuthScreen>
  );
}
