import React from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/common/Button';
import { Routes } from '@/constants/routes';
import { AuthStackParamList } from '@/navigation/RootNavigator';

import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, Routes.HOME>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <PrimaryButton
        title="Go to login"
        onPress={() => navigation.navigate(Routes.LOGIN)}
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
});
