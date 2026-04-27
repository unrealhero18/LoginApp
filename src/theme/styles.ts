import { StyleSheet } from 'react-native';

import { Colors } from './colors';
import { Spacing } from './spacing';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    backgroundColor: Colors.background,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
