import { useRootNavigationState, usePathname, router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { restoreSession } from '@/lib/session';
import { useAuthStore } from '@/stores/auth-store';

const publicRoutes = new Set([
  '/',
  '/welcome',
  '/sign-in',
  '/register',
  '/forgot-password',
  '/verify-reset-otp',
  '/reset-password',
  '/verify-email',
]);

export function SessionGuard() {
  const navigationState = useRootNavigationState();
  const pathname = usePathname();
  const route = useAuthStore((state) => state.route);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    void restoreSession();
  }, []);

  useEffect(() => {
    if (!navigationState?.key || status === 'restoring') {
      return;
    }

    const destination = getDestination(pathname, route, status);
    if (destination) {
      router.replace(destination as Href);
    }
  }, [navigationState?.key, pathname, route, status]);

  if (status !== 'restoring') {
    return null;
  }

  return (
    <View className="absolute inset-0 items-center justify-center bg-background dark:bg-background-dark">
      <ActivityIndicator color="#D99113" />
      <Text className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">Restoring your library...</Text>
    </View>
  );
}

function getDestination(pathname: string, route: string, status: string) {
  if (status === 'unauthenticated') {
    return publicRoutes.has(pathname) ? null : '/welcome';
  }

  if (route === 'verify-email') {
    return pathname === '/verify-email' ? null : '/verify-email';
  }

  if (route === 'interests') {
    return pathname === '/interests' ? null : '/interests';
  }

  return publicRoutes.has(pathname) || pathname === '/verify-email' || pathname === '/interests' ? '/home' : null;
}
