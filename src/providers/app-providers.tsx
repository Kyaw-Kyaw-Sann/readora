import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';

import { hydrateTheme, useThemeStore } from '@/stores/theme-store';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeController>{children}</ThemeController>
    </QueryClientProvider>
  );
}

function ThemeController({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    void hydrateTheme();
  }, []);

  useEffect(() => {
    setColorScheme(theme);
  }, [setColorScheme, theme]);

  return <>{children}</>;
}
