import { router, type Href } from 'expo-router';

import { AuthPlaceholder } from '@/components/navigation/auth-placeholder';

export default function SignInScreen() {
  return <AuthPlaceholder actionLabel="Create Account" onAction={() => router.push('/register' as Href)} subtitle="Sign in to continue your reading journey." title="Welcome back" />;
}
