import React from 'react';

import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/Button';
import { OfflineMessages } from '@/constants/messages';
import { useAuth } from '@/hooks/useAuth';

import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

export default function OfflineScreen() {
  const { token, retryHydration } = useAuth();

  const message = token
    ? OfflineMessages.SESSION_SAVED
    : OfflineMessages.CONNECTION_REQUIRED;

  return (
    <View style={styles.container}>
      <AppText fontWeight="600" style={styles.title}>
        {OfflineMessages.TITLE}
      </AppText>
      <AppText style={styles.message}>{message}</AppText>
      <View style={styles.actions}>
        <PrimaryButton title={OfflineMessages.RECONNECT_BUTTON} onPress={retryHydration} />
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
