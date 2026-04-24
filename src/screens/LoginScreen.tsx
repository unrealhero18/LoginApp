import React from 'react';

import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/Button';
import { Routes } from '@/constants/routes';
import { RootStackParamList } from '@/navigation/RootNavigator';

import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, Routes.LOGIN>;

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <AppText fontWeight="600" style={styles.title}>Login Screen</AppText>
      <PrimaryButton title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.lg,
  },
});
