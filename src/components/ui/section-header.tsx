import { Text, View } from 'react-native';

interface SectionHeaderProps {
  className?: string;
  title: string;
}

export function SectionHeader({ className, title }: SectionHeaderProps) {
  return (
    <View className={className}>
      <Text className="font-serif text-2xl text-text dark:text-text-dark">{title}</Text>
    </View>
  );
}
