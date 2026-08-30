import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost';

interface AppButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, { container: string; label: string }> = {
  primary: {
    container: 'bg-primary active:bg-primary-dark',
    label: 'text-white',
  },
  secondary: {
    container: 'bg-primary-soft active:bg-primary-soft/80',
    label: 'text-primary-dark',
  },
  outline: {
    container: 'border border-primary bg-transparent active:bg-primary-soft/50',
    label: 'text-primary-dark dark:text-primary',
  },
  ghost: {
    container: 'bg-transparent active:bg-primary-soft/50',
    label: 'text-primary-dark dark:text-primary',
  },
};

export function AppButton({ className, disabled, label, loading = false, variant = 'primary', ...props }: AppButtonProps) {
  const styles = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`min-h-12 items-center justify-center rounded-xl px-5 ${styles.container} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      disabled={isDisabled}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#D99113'} />
      ) : (
        <Text className={`text-base font-semibold ${styles.label}`}>{label}</Text>
      )}
    </Pressable>
  );
}
