import React from 'react';

import { AppText } from '@/components/common/AppText';

import { styles } from './Input.styles';

type Props = {
  message: string;
  testID?: string;
};

export const InputError: React.FC<Props> = ({ message, testID }) => {
  return (
    <AppText
      style={styles.errorText}
      accessibilityLiveRegion="polite"
      testID={testID ? `${testID}-error-text` : undefined}
    >
      {message}
    </AppText>
  );
};
