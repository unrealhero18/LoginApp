import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Routes } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import OfflineScreen from '@/screens/OfflineScreen';
import ProfileScreen from '@/screens/ProfileScreen';

import { Colors } from '@/theme/colors';

export type AuthStackParamList = {
  [Routes.HOME]: undefined;
  [Routes.LOGIN]: undefined;
};

export type AppStackParamList = {
  [Routes.PROFILE]: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator initialRouteName={Routes.HOME}>
      <AuthStack.Screen name={Routes.HOME} component={HomeScreen} />
      <AuthStack.Screen name={Routes.LOGIN} component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator initialRouteName={Routes.PROFILE}>
      <AppStack.Screen name={Routes.PROFILE} component={ProfileScreen} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const { token, isHydrating, isOffline } = useAuth();

  if (isHydrating) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (isOffline) {
    return <OfflineScreen />;
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
