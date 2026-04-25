import React from 'react';

import { Keyboard, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { ErrorMessages } from '@/constants/messages';
import { useForm } from '@/hooks/useForm';
import { resolveErrorMessage } from '@/utils/error';

import { Spacing } from '@/theme/spacing';

import type { LoginPayload } from '@/types/auth';

interface LoginFormProps {
  onSubmit: (values: LoginPayload) => void;
  isLoading: boolean;
  error: Error | null;
  onResetError: () => void;
}

export const LoginForm = ({ onSubmit, isLoading, error, onResetError }: LoginFormProps) => {
  const { values, handleChange, handleSubmit, isValid } = useForm<LoginPayload>({
    initialValues: { username: '', password: '' },
    onSubmit: (formValues) => {
      Keyboard.dismiss();
      onSubmit(formValues);
    },
    onValueChange: () => {
      if (error) {
        onResetError();
      }
    },
    validate: (formValues) =>
      formValues.username.length > 0 && formValues.password.length > 0 && !isLoading,
  });

  const errorMessage = resolveErrorMessage(error, ErrorMessages.LOGIN_FAILURE);

  return (
    <View style={styles.container}>
      <Input
        label="Username"
        value={values.username}
        onChangeText={handleChange('username')}
        onClear={() => handleChange('username')('')}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        testID="username-input"
      />

      <Input
        label="Password"
        value={values.password}
        onChangeText={handleChange('password')}
        onClear={() => handleChange('password')('')}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        testID="password-input"
      />

      <ErrorMessage message={errorMessage} testID="login-error" />

      <PrimaryButton
        title="Login"
        onPress={handleSubmit}
        disabled={!isValid}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginBottom: Spacing.md,
  },
});
