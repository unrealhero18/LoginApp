import React from 'react';
import { StyleSheet } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { ButtonBase } from '@/components/common/Button/ButtonBase';
import { Colors } from '@/theme/colors';
import { Typography } from '@/theme/typography';

type Props = {
  title: string;
  disabled?: boolean;
  onPress?: () => void;
};

export function SecondaryButton({ title, disabled = false, onPress }: Props) {
  return (
    <ButtonBase disabled={disabled} onPress={onPress} style={styles.background}>
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
  label: {
    fontSize: Typography.size.md,
    lineHeight: Typography.size.md * Typography.lineHeight.normal,
    letterSpacing: 0,
    textAlign: 'center',
    color: Colors.INK,
  },
});
