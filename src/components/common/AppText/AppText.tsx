import React from 'react';
import { Text, TextProps } from 'react-native';

import { cn } from '@/utils/style';

import { styles } from './AppText.styles';

export interface AppTextProps extends TextProps {
  fontWeight?: '400' | '500' | '600';
}

export const AppText = ({
  style,
  fontWeight = '400',
  ...props
}: AppTextProps) => {
  return (
    <Text
      {...props}
      style={[cn(styles, 'text'), { fontWeight }, style]}
    />
  );
};
