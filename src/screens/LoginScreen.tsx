import React, { useState } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Routes } from '@/constants/routes';
import { AuthStackParamList } from '@/navigation/RootNavigator';

import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, Routes.LOGIN>;

export default function LoginScreen(_: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Input
        label="Username"
        value={username}
        onChangeText={setUsername}
        onClear={() => setUsername('')}
        style={styles.input}
        testID="username-input"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        onClear={() => setPassword('')}
        secureTextEntry
        errorMessage={password.length > 0 && password.length < 6 ? 'Min 6 characters' : undefined}
        style={styles.input}
        testID="password-input"
      />

      <PrimaryButton title="Login" onPress={() => { }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
  },
  title: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: Spacing.md,
  },
});
