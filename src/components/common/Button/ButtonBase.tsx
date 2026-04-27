import React from 'react';
import {
  AccessibilityRole,
  AccessibilityState,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { Spacing } from '@/theme/spacing';
import { globalStyles } from '@/theme/styles';
import { cn } from '@/utils/styles';

type Props = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

export function ButtonBase({
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  children,
  disabled = false,
  onPress,
  style,
}: Props) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled,
        ...accessibilityState,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        cn([styles, globalStyles], 'base', { disabled, pressed }),
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
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
