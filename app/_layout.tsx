import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import '../global.css';
import { SessionGuard } from '@/components/session/session-guard';
import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <SessionGuard />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
