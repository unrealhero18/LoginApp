import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/common/ErrorBoundary/ErrorBoundary';
import RootNavigator from '@/navigation/RootNavigator';
import { AuthProvider } from '@/providers/AuthProvider';
import { queryClient } from '@/providers/queryClient';
import { Colors, NavigationTheme } from '@/theme';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <NavigationContainer theme={NavigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
