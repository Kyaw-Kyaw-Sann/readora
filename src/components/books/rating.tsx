import { Text, View } from 'react-native';

export function Rating({ className, value }: { className?: string; value: number }) {
  return (
    <View className={`flex-row items-center gap-1 ${className ?? ''}`}>
      <Text className="text-sm text-primary">★</Text>
      <Text className="text-sm text-text-muted dark:text-text-muted-dark">{value.toFixed(1)}</Text>
    </View>
  );
}
