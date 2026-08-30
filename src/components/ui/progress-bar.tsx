import { View } from 'react-native';

interface ProgressBarProps {
  className?: string;
  value: number;
}

export function ProgressBar({ className, value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <View className={`h-2 overflow-hidden rounded-full bg-primary-soft dark:bg-border-dark ${className ?? ''}`}>
      <View className="h-full rounded-full bg-primary" style={{ width: `${safeValue}%` }} />
    </View>
  );
}
