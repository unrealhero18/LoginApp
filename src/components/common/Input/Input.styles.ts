import { StyleSheet } from 'react-native';

import { Colors } from '@/theme/colors';
import { Fonts } from '@/theme/fonts';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export const styles = StyleSheet.create({
  container: {
    height: Spacing.floatingInputHeight,
    borderWidth: 1,
    borderRadius: Spacing.radius.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.sm,
    borderColor: Colors.borderInput,
  },
  containerFocused: {
    borderColor: Colors.primary,
  },
  containerError: {
    borderColor: Colors.danger,
  },
  label: {
    position: 'absolute',
    left: Spacing.md,
    includeFontPadding: false,
    color: Colors.textSecondary,
  },
  labelFocused: {
    color: Colors.primary,
  },
  labelError: {
    color: Colors.danger,
  },
  input: {
    fontSize: Typography.size.md,
    color: Colors.text,
    fontFamily: Fonts.notoSans,
    includeFontPadding: false,
    padding: 0,
  },
  inputWithClear: {
    paddingRight: Spacing.xl,
  },
  clearButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    marginTop: Spacing.xs,
    fontSize: Typography.size.xs,
    color: Colors.danger,
  },
});
