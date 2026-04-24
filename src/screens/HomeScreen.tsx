import React from 'react';

import { useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Text, View } from 'react-native';

import { Routes } from '@/constants/routes';
import { RootStackParamList } from '@/navigation/RootNavigator';

import { globalStyles } from '@/theme/styles';

type Props = NativeStackScreenProps<RootStackParamList, Routes.HOME>;

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <View style={globalStyles.container}>
      <Text style={{ color: colors.text }}>Home Screen</Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate(Routes.LOGIN)}
      />
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate(Routes.PROFILE)}
      />
    </View>
  );
}

