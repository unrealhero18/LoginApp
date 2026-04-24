import React from 'react';

import { StyleSheet, Text, TextProps } from 'react-native';

import { Fonts } from '@/theme/fonts';

export interface AppTextProps extends TextProps {
  fontWeight?: '400' | '500' | '600';
}

export const AppText = ({ style, fontWeight = '400', ...props }: AppTextProps) => {
  return (
    <Text 
      {...props} 
      style={[
        styles.text, 
        { fontWeight }, 
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.notoSans,
  },
});
