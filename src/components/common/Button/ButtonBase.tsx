import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { cn } from '@/utils/styles';

import { Spacing } from '@/theme/spacing';
import { globalStyles } from '@/theme/styles';

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

export function ButtonBase({
  children,
  disabled = false,
  onPress,
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        cn([styles, globalStyles], 'base', { disabled, pressed }),
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
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
