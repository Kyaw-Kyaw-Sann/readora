import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type AppIconName = 'arrow-left' | 'headphones' | 'heart' | 'home' | 'library' | 'moon' | 'profile' | 'search' | 'share' | 'sun';

interface AppIconProps {
  color?: ColorValue;
  filled?: boolean;
  name: AppIconName;
  size?: number;
  strokeWidth?: number;
}

export function AppIcon({ color = '#382D23', filled = false, name, size = 24, strokeWidth = 1.9 }: AppIconProps) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  };

  return (
    <Svg accessibilityElementsHidden focusable={false} height={size} viewBox="0 0 24 24" width={size}>
      {name === 'search' ? (
        <>
          <Circle cx="10.8" cy="10.8" r="6.8" {...common} />
          <Line x1="16" x2="21" y1="16" y2="21" {...common} />
        </>
      ) : null}
      {name === 'arrow-left' ? <Path d="M19 12H5M11 18l-6-6 6-6" {...common} /> : null}
      {name === 'heart' ? <Path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.4a5.5 5.5 0 0 0-.1-7.8Z" {...common} fill={filled ? color : 'none'} /> : null}
      {name === 'share' ? (
        <>
          <Path d="M12 16V3M7.5 7.5 12 3l4.5 4.5" {...common} />
          <Path d="M7 10H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2" {...common} />
        </>
      ) : null}
      {name === 'sun' ? (
        <>
          <Circle cx="12" cy="12" r="4" {...common} />
          <Path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" {...common} />
        </>
      ) : null}
      {name === 'moon' ? <Path d="M20.5 15.2A8.3 8.3 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" {...common} /> : null}
      {name === 'home' ? (
        <>
          <Path d="m3 10.5 9-7 9 7" {...common} />
          <Path d="M5.5 9v11h13V9M9.5 20v-6h5v6" {...common} />
        </>
      ) : null}
      {name === 'library' ? (
        <>
          <Rect height="17" rx="1" width="4" x="3" y="4" {...common} />
          <Rect height="17" rx="1" width="4" x="9" y="4" {...common} />
          <Path d="m16 5 3.5-1 3.5 15-3.5 1Z" {...common} />
        </>
      ) : null}
      {name === 'profile' ? (
        <>
          <Circle cx="12" cy="8" r="4" {...common} />
          <Path d="M4.5 21a7.5 7.5 0 0 1 15 0" {...common} />
        </>
      ) : null}
      {name === 'headphones' ? (
        <>
          <Path d="M4 14v-2a8 8 0 0 1 16 0v2" {...common} />
          <Path d="M4 14a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2ZM20 14a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2Z" {...common} />
        </>
      ) : null}
    </Svg>
  );
}
