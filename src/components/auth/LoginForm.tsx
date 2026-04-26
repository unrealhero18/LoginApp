import React from 'react';

import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { useForm } from '@/hooks/useForm';
import { getLoginErrorMessage } from '@/utils/error';

import { validateLogin } from '@/utils/validation';

import { Spacing } from '@/theme/spacing';

import type { LoginPayload } from '@/types/auth';

type LoginFormProps = {
  error: Error | null;
  isLoading: boolean;
  onResetError: () => void;
  onSubmit: (values: LoginPayload) => void;
};

export const LoginForm = ({ onSubmit, isLoading, error, onResetError }: LoginFormProps) => {
  const { values, errors, handleChange, handleSubmit, isComplete } =
    useForm<LoginPayload>({
      error,
      initialValues: { username: '', password: '' },
      onResetError,
      onSubmit,
      validate: validateLogin,
    });

  const errorMessage = getLoginErrorMessage(error);

  return (
    <View style={styles.container}>
      <Input
        label="Username"
        value={values.username}
        onChangeText={handleChange('username')}
        onClear={() => handleChange('username')('')}
        errorMessage={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={128}
        style={styles.input}
        testID="username-input"
      />

      <Input
        label="Password"
        value={values.password}
        onChangeText={handleChange('password')}
        onClear={() => handleChange('password')('')}
        errorMessage={errors.password}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={128}
        style={styles.input}
        testID="password-input"
      />

      <ErrorMessage message={errorMessage} testID="login-error" />

      <PrimaryButton
        title="Login"
        onPress={handleSubmit}
        disabled={!isComplete}
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
