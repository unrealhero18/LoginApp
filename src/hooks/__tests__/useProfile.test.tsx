import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';

import { useProfile } from '@/hooks/useProfile';
import { AuthProvider } from '@/providers/AuthProvider';
import * as authService from '@/services/api/auth';
import { createTestQueryClient } from '@/test-utils/renderWithAuth';

import type { AuthToken, AuthUser } from '@/types/auth';

jest.mock('@/services/api/auth');
jest.mock('@/services/api/client', () => {
  const actual = jest.requireActual<typeof import('@/services/api/client')>(
    '@/services/api/client',
  );
  return {
    ...actual,
    setAuthToken: jest.fn(),
    setOnUnauthorized: jest.fn(),
  };
});

const mockedAuth = jest.mocked(authService);
const mockedKeychain = jest.mocked(Keychain);

const TOKEN: AuthToken = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  id: 1,
};

const USER: AuthUser = {
  id: 1,
  username: 'emily',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://dummyjson.com/icon/emilyjohnson.png',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedKeychain.getGenericPassword.mockResolvedValue(false);
  });

  it('is disabled when no token is present', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedAuth.getMe).not.toHaveBeenCalled();
  });

  it('fetches profile when a token becomes available via hydration', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue({
      service: 'loginapp.auth',
      username: 'auth-token',
      password: JSON.stringify(TOKEN),
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
    mockedAuth.getMe.mockResolvedValue(USER);

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(USER);
  });
});
