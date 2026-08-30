import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useState } from 'react';

interface AppTextInputProps extends TextInputProps {
  error?: string;
  label: string;
}

export function AppTextInput({ className, error, label, secureTextEntry, ...props }: AppTextInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordInput = secureTextEntry === true;

  return (
    <View className={className}>
      <Text className="mb-2 text-sm font-medium text-text dark:text-text-dark">{label}</Text>
      <View className={`min-h-12 flex-row items-center rounded-xl border bg-surface px-4 dark:bg-surface-dark ${error ? 'border-danger' : 'border-border dark:border-border-dark'}`}>
        <TextInput
          className="flex-1 py-3 text-base text-text dark:text-text-dark"
          placeholderTextColor="#887C71"
          secureTextEntry={isPasswordInput && !passwordVisible}
          {...props}
        />
        {isPasswordInput ? (
          <Pressable accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'} className="ml-3" onPress={() => setPasswordVisible((visible) => !visible)}>
            <Text className="text-sm font-medium text-primary-dark dark:text-primary">{passwordVisible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="mt-1.5 text-xs text-danger">{error}</Text> : null}
    </View>
  );
}
