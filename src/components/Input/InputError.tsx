import React from 'react';

import { AppText } from '@/components/AppText';

import { styles } from './Input.styles';

interface Props {
  message: string;
  testID?: string;
}

export const InputError: React.FC<Props> = ({ message, testID }) => {
  return (
    <AppText
      style={styles.errorText}
      accessibilityLiveRegion="polite"
      testID={`${testID}-error-text`}
    >
      {message}
    </AppText>
  );
};
