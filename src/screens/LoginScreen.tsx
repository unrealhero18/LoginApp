import React, { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Keyboard, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Routes } from '@/constants/routes';
import { useLogin } from '@/hooks/useLogin';
import { AuthStackParamList } from '@/navigation/RootNavigator';
import { ErrorMessages } from '@/constants/messages';
import { resolveErrorMessage } from '@/utils/error';

import { AppText } from '@/components/common/AppText';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, Routes.LOGIN>;

export default function LoginScreen(_: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending, error, reset } = useLogin();

  const handleSubmit = (): void => {
    Keyboard.dismiss();
    if (error) {
      reset();
    }
    mutate({ username, password });
  };

  const errorMessage = resolveErrorMessage(error, ErrorMessages.LOGIN_FAILURE);
  const canSubmit = username.length > 0 && password.length > 0 && !isPending;

  return (
    <View style={styles.container}>
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        onClear={() => setUsername('')}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        testID="username-input"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        onClear={() => setPassword('')}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        testID="password-input"
      />

      {errorMessage && (
        <AppText style={styles.errorMessage} testID="login-error">
          {errorMessage}
        </AppText>
      )}

      <PrimaryButton
        title="Login"
        onPress={handleSubmit}
        disabled={!canSubmit}
        isLoading={isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
  },
  input: {
    marginBottom: Spacing.md,
  },
  errorMessage: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
