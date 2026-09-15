import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { colors } from '@/constants/theme';

const tabIcons: Record<string, AppIconName> = {
  home: 'home',
  library: 'library',
  profile: 'profile',
  search: 'search',
} as const;

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
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
          height: 62 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 7,
        },
        tabBarIcon: ({ color, focused }) => (
          <AppIcon color={color} name={tabIcons[route.name]} size={23} strokeWidth={focused ? 2.4 : 1.8} />
        ),
      })}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
