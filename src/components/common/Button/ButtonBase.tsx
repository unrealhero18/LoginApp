import React from 'react';

import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { Spacing } from '@/theme/spacing';

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function ButtonBase({ children, disabled = false, onPress, style }: Props) {
  return (
    <Pressable
      style={[styles.base, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: Spacing.buttonHeight,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.32,
  },
});
