import React from 'react';

import { useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Text, View } from 'react-native';

import { Routes } from '@/constants/routes';
import { RootStackParamList } from '@/navigation/RootNavigator';

import { globalStyles } from '@/theme/styles';

type Props = NativeStackScreenProps<RootStackParamList, Routes.PROFILE>;

export default function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <View style={globalStyles.container}>
      <Text style={{ color: colors.text }}>Profile Screen</Text>
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
}

