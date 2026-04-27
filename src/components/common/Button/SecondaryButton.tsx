import React from 'react';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { ButtonBase } from '@/components/common/Button/ButtonBase';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { cn } from '@/utils/styles';

type Props = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
  title: string;
};

export function SecondaryButton({
  accessibilityHint,
  accessibilityLabel,
  disabled = false,
  onPress,
  title,
}: Props) {
  return (
    <ButtonBase
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel || title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => cn(styles, 'background', { pressed })}
    >
      <AppText fontWeight="500" style={styles.label}>
        {title}
      </AppText>
    </ButtonBase>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.WHITE,
  },
  pressed: {
    backgroundColor: Colors.GRAY,
  },
  label: {
    fontSize: Typography.size.md,
    lineHeight: Typography.size.md * Typography.lineHeight.normal,
    letterSpacing: 0,
    textAlign: 'center',
    color: Colors.INK,
  },
});
