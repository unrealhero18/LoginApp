import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Routes } from '@/constants/routes';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import ProfileScreen from '@/screens/ProfileScreen';

export type RootStackParamList = {
  [Routes.HOME]: undefined;
  [Routes.LOGIN]: undefined;
  [Routes.PROFILE]: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName={Routes.HOME}>
      <Stack.Screen name={Routes.HOME} component={HomeScreen} />
      <Stack.Screen name={Routes.LOGIN} component={LoginScreen} />
      <Stack.Screen name={Routes.PROFILE} component={ProfileScreen} />
    </Stack.Navigator>
  );
}
