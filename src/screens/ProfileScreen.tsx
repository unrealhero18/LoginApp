import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/Button';
import { Routes } from '@/constants/routes';
import { AppStackParamList } from '@/navigation/RootNavigator';

import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<AppStackParamList, Routes.PROFILE>;

export default function ProfileScreen(_: Props) {
  return (
    <View style={styles.container}>
      <AppText fontWeight="600" style={styles.title}>Profile Screen</AppText>
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
