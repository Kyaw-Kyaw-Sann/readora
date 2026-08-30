import { router, type Href } from 'expo-router';

import { AuthPlaceholder } from '@/components/navigation/auth-placeholder';

export default function ResetPasswordScreen() {
  return <AuthPlaceholder actionLabel="Back to Sign In" onAction={() => router.replace('/sign-in' as Href)} subtitle="Choose a new password for your account." title="Reset password" />;
}
