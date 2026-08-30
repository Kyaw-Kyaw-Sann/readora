import { router, type Href } from 'expo-router';

import { AuthPlaceholder } from '@/components/navigation/auth-placeholder';

export default function VerifyResetOtpScreen() {
  return <AuthPlaceholder actionLabel="Set new password" onAction={() => router.push('/reset-password' as Href)} subtitle="Enter the six-digit code we sent to your email." title="Verify reset code" />;
}
