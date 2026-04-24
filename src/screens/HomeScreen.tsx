import React from 'react';

import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PrimaryButton } from '@/components/Button';
import { Routes } from '@/constants/routes';
import { RootStackParamList } from '@/navigation/RootNavigator';

import { Spacing } from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, Routes.HOME>;

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
