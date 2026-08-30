import { router, type Href } from 'expo-router';

import { AuthPlaceholder } from '@/components/navigation/auth-placeholder';

export default function RegisterScreen() {
  return <AuthPlaceholder actionLabel="Already have an account? Sign In" onAction={() => router.replace('/sign-in' as Href)} subtitle="Create an account and discover stories picked for you." title="Create your account" />;
}
