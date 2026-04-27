import { StyleSheet } from 'react-native';

import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    marginBottom: Spacing.md,
    fontSize: Typography.size.xl,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  actions: {
    width: '100%',
  },
});
