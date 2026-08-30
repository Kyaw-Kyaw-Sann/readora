import { router, type Href } from 'expo-router';

import { AuthPlaceholder } from '@/components/navigation/auth-placeholder';

export default function VerifyEmailScreen() {
  return <AuthPlaceholder actionLabel="Continue to interests" onAction={() => router.replace('/interests' as Href)} subtitle="Check your inbox and verify your email to continue." title="Verify your email" />;
}
