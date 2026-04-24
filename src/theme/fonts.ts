import { Platform } from 'react-native';

export const Fonts = {
  notoSans: Platform.select({
    ios: 'Noto Sans',
    android: 'notosans',
  }) || 'Noto Sans',
} as const;
