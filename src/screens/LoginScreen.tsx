import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';

import { LoginForm } from '@/components/auth/LoginForm';
import { Routes } from '@/constants/routes';
import { useLogin } from '@/hooks/useLogin';
import { AuthStackParamList } from '@/navigation/RootNavigator';

import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, Routes.LOGIN>;

export default function LoginScreen(_: Props) {
  const { mutate, isPending, error, reset } = useLogin();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LoginForm
          onSubmit={mutate}
          isLoading={isPending}
          error={error}
          onResetError={reset}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
  },
});
