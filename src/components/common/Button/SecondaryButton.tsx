import React from 'react';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/common/AppText/AppText';
import { ButtonBase } from '@/components/common/Button/ButtonBase';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';
import { cn } from '@/utils/style';

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
      style={({ pressed }) => cn(styles, 'background', { pressed, disabled })}
    >
      <AppText fontWeight="500" style={styles.label}>
        {title}
      </AppText>
    </ButtonBase>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.surface,
  },
  pressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  disabled: {},
  label: {
    fontSize: Typography.size.md,
    lineHeight: Typography.size.md * Typography.lineHeight.normal,
    letterSpacing: 0,
    textAlign: 'center',
    color: Colors.text,
  },
});
