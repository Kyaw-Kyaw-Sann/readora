import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Text } from 'react-native';

import { colors } from '@/constants/theme';

const tabIcons = {
  home: '⌂',
  library: '▤',
  profile: '♙',
  search: '⌕',
} as const;

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: dark ? colors.textMutedDark : colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: dark ? colors.surfaceDark : colors.surface,
          borderTopColor: dark ? colors.borderDark : colors.border,
          height: 64,
          paddingTop: 6,
        },
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>{tabIcons[route.name as keyof typeof tabIcons]}</Text>,
      })}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
