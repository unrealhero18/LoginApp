import React from 'react';

import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

export default function OfflineScreen() {
  const { token, retryHydration } = useAuth();

  const message = token
    ? 'Your session is saved. Connect to the internet and tap Reconnect to continue.'
    : 'An internet connection is required to continue. Please connect and tap Reconnect.';

  return (
    <View style={styles.container}>
      <AppText fontWeight="600" style={styles.title}>
        No Internet Connection
      </AppText>
      <AppText style={styles.message}>{message}</AppText>
      <View style={styles.actions}>
        <PrimaryButton title="Reconnect" onPress={retryHydration} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    marginBottom: Spacing.md,
  },
  message: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  actions: {
    width: '100%',
  },
});
