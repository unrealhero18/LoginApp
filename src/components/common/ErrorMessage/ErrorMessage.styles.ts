import { StyleSheet } from 'react-native';

import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  message: {
    flex: 1,
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
});
