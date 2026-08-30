import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="font-serif text-4xl text-primary">Readora</Text>
      <Text className="mt-2 text-center text-base text-text-muted">
        Your reading journey is being prepared.
      </Text>
    </View>
  );
}
