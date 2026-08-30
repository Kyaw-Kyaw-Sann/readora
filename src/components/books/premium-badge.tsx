import { Text, View } from 'react-native';

export function PremiumBadge({ className }: { className?: string }) {
  return (
    <View className={`rounded-full bg-primary px-2 py-1 ${className ?? ''}`}>
      <Text className="text-[10px] font-bold tracking-wide text-white">PREMIUM</Text>
    </View>
  );
}
