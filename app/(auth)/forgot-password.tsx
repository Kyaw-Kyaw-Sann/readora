import { router, type Href } from 'expo-router';

import { AuthPlaceholder } from '@/components/navigation/auth-placeholder';

export default function ForgotPasswordScreen() {
  return <AuthPlaceholder actionLabel="Continue" onAction={() => router.push('/verify-reset-otp' as Href)} subtitle="We will send a reset code to your email address." title="Forgot password?" />;
}
