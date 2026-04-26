import React from 'react';

import { fireEvent, render } from '@testing-library/react-native';

import { useAuth } from '@/hooks/useAuth';
import OfflineScreen from '@/screens/OfflineScreen';

import type { AuthContextValue } from '@/providers/AuthProvider';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => jest.fn()),
}));
jest.mock('@/hooks/useAuth');

const mockRetryHydration = jest.fn();

function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: null,
    token: null,
    isHydrating: false,
    isOffline: true,
    login: jest.fn(),
    logout: jest.fn(),
    retryHydration: mockRetryHydration,
    ...overrides,
  };
}

describe('OfflineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue(makeAuthValue());
  });

  it('renders the generic offline message when NO token exists (fresh install)', () => {
    jest.mocked(useAuth).mockReturnValue(makeAuthValue({ token: null }));
    const { getByText } = render(<OfflineScreen />);
    expect(getByText('No Internet Connection')).toBeTruthy();
    expect(
      getByText(
        'An internet connection is required to continue. Please connect and tap Reconnect.',
      ),
    ).toBeTruthy();
  });

  it('renders the session-saved message when a token exists', () => {
    jest.mocked(useAuth).mockReturnValue(
      makeAuthValue({
        token: { accessToken: 'abc', refreshToken: 'def', id: 1 },
      }),
    );
    const { getByText } = render(<OfflineScreen />);
    expect(
      getByText(
        'Your session is saved. Connect to the internet and tap Reconnect to continue.',
      ),
    ).toBeTruthy();
  });

  it('renders the Reconnect button', () => {
    const { getByText } = render(<OfflineScreen />);
    expect(getByText('Reconnect')).toBeTruthy();
  });

  it('calls retryHydration when the Reconnect button is pressed', () => {
    const { getByText } = render(<OfflineScreen />);
    fireEvent.press(getByText('Reconnect'));
    expect(mockRetryHydration).toHaveBeenCalledTimes(1);
  });
});
