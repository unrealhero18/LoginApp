import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { AppText } from '@/components/common/AppText';
import { ButtonBase } from '@/components/common/Button/ButtonBase';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

type Props = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  title: string;
};

export function PrimaryButton({
  accessibilityHint,
  accessibilityLabel,
  disabled = false,
  isLoading = false,
  onPress,
  title,
}: Props) {
  return (
    <ButtonBase
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel || title}
      disabled={disabled || isLoading}
      onPress={onPress}
      style={styles.shadow}
    >
      <LinearGradient
        colors={[Colors.BLUE_LIGHT, Colors.BLUE]}
        locations={[0.0757, 0.9243]}
        start={{ x: 1, y: 0.4 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.gradient}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.WHITE} />
        ) : (
          <AppText fontWeight="500" style={styles.label}>
            {title}
          </AppText>
        )}
      </LinearGradient>
    </ButtonBase>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: Colors.BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BLUE,
  },
  label: {
    fontSize: Typography.size.md,
    lineHeight: Typography.size.md * Typography.lineHeight.normal,
    letterSpacing: 0,
    textAlign: 'center',
    color: Colors.WHITE,
  },
});
