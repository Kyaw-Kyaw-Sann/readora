import { Pressable } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { colors } from '@/constants/theme';
import { persistTheme, useThemeStore } from '@/stores/theme-store';

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <Pressable
      accessibilityHint="Switches between light and dark themes"
      accessibilityLabel={`Switch to ${nextTheme} theme`}
      className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface active:bg-primary-soft dark:border-border-dark dark:bg-surface-dark"
      onPress={() => void persistTheme(nextTheme)}>
      <AppIcon color={colors.primaryDark} name={theme === 'light' ? 'moon' : 'sun'} size={22} />
    </Pressable>
  );
}
