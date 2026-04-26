import React from 'react';
import { View } from 'react-native';

import InfoIcon from '@/assets/icons/info.svg';
import { AppText } from '@/components/common/AppText';

import { styles } from './ErrorMessage.styles';

type ErrorMessageProps = {
  message: string | null;
  testID?: string;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  testID,
}) => {
  if (!message) return null;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <InfoIcon />
      </View>
      <AppText style={styles.message}>{message}</AppText>
    </View>
  );
};
