import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '../global.css';
import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </AppProviders>
  );
}
