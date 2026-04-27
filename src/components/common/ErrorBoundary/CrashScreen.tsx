import React from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/Button';
import { ErrorBoundaryMessages } from '@/constants/messages';

import { styles } from './CrashScreen.styles';

interface CrashScreenProps {
  resetError: () => void;
}

export const CrashScreen: React.FC<CrashScreenProps> = ({ resetError }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AppText style={styles.icon}>⚠️</AppText>
      </View>
      <AppText fontWeight="600" style={styles.title}>
        {ErrorBoundaryMessages.CRASH_TITLE}
      </AppText>
      <AppText style={styles.message}>
        {ErrorBoundaryMessages.CRASH_MESSAGE}
      </AppText>
      <View style={styles.actions}>
        <PrimaryButton
          title={ErrorBoundaryMessages.CRASH_RETRY_BUTTON}
          onPress={resetError}
        />
      </View>
    </View>
  );
};
