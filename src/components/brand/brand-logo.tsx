import { Text, View } from 'react-native';

import LogoMark from '../../../assets/logo2.svg';

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<BrandLogoSize, number> = {
  sm: 32,
  md: 44,
  lg: 72,
  xl: 132,
};

interface BrandLogoProps {
  showWordmark?: boolean;
  size?: BrandLogoSize;
}

export function BrandLogo({ showWordmark = false, size = 'md' }: BrandLogoProps) {
  const dimension = sizes[size];
  const wordmarkSize = size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <View accessibilityLabel="Readora" accessible className="items-center">
      <LogoMark height={dimension} width={dimension} />
      {showWordmark ? <Text className={`mt-1 font-serif text-primary ${wordmarkSize}`}>Readora</Text> : null}
    </View>
  );
}
