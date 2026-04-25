jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(() => true),
  Screen: 'RNSScreen',
  InnerScreen: 'RNSScreen',
  ScreenContainer: 'RNSScreenContainer',
  ScreenStack: 'RNSScreenStack',
  ScreenStackItem: 'RNSScreenStackItem',
  FullWindowOverlay: 'RNSFullWindowOverlay',
  ScreenFooter: 'RNSScreenFooter',
  ScreenContentWrapper: 'RNSScreenContentWrapper',
  SearchBar: 'RNSSearchBar',
  useTransitionProgress: jest.fn(() => ({ progress: { value: 0 } })),
  compatibilityFlags: {
    usesNewAndroidHeaderHeightImplementation: true,
  },
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 0, left: 0, right: 0, bottom: 0 };
  const frame = { x: 0, y: 0, width: 320, height: 640 };
  const InsetsContext = React.createContext(insets);
  const FrameContext = React.createContext(frame);
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaConsumer: InsetsContext.Consumer,
    SafeAreaContext: InsetsContext,
    SafeAreaInsetsContext: InsetsContext,
    SafeAreaFrameContext: FrameContext,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test mock: gradient props unavailable without full package types
  return (props: any) => React.createElement(View, props, props.children);
});

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  STORAGE_TYPE: {
    AES_CBC: 'KeystoreAESCBC',
    AES_GCM_NO_AUTH: 'KeystoreAESGCM_NoAuth',
    AES_GCM: 'KeystoreAESGCM',
    RSA: 'KeystoreRSAECB',
  },
}));
