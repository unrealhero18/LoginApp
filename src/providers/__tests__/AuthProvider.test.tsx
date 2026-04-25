import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';

import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/providers/AuthProvider';
import * as authService from '@/services/api/auth';
import * as client from '@/services/api/client';
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

const mockedKeychain = jest.mocked(Keychain);
const mockedAuth = jest.mocked(authService);
const mockedClient = jest.mocked(client);

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

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedKeychain.getGenericPassword.mockResolvedValue(false);
  });

  it('finishes hydration as logged-out when no stored token exists', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('hydrates user when a stored token resolves successfully', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue({
      service: 'loginapp.auth',
      username: 'auth-token',
      password: JSON.stringify(TOKEN),
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
    mockedAuth.getMe.mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(mockedClient.setAuthToken).toHaveBeenCalledWith(TOKEN.accessToken);
    expect(result.current.token).toEqual(TOKEN);
    expect(result.current.user).toEqual(USER);
  });

  it('clears stored token if hydration getMe call fails', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue({
      service: 'loginapp.auth',
      username: 'auth-token',
      password: JSON.stringify(TOKEN),
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
    mockedAuth.getMe.mockRejectedValueOnce(new Error('expired'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
  });

  it('login persists token, fetches profile, and updates state', async () => {
    mockedAuth.login.mockResolvedValue(TOKEN);
    mockedAuth.getMe.mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    await act(async () => {
      await result.current.login({ username: 'emily', password: 'secret' });
    });

    expect(mockedAuth.login).toHaveBeenCalledWith({ username: 'emily', password: 'secret' });
    expect(mockedKeychain.setGenericPassword).toHaveBeenCalled();
    expect(mockedClient.setAuthToken).toHaveBeenCalledWith(TOKEN.accessToken);
    expect(result.current.token).toEqual(TOKEN);
    expect(result.current.user).toEqual(USER);
  });

  it('logout clears state, token storage, and api client token', async () => {
    mockedAuth.login.mockResolvedValue(TOKEN);
    mockedAuth.getMe.mockResolvedValue(USER);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    await act(async () => {
      await result.current.login({ username: 'emily', password: 'secret' });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockedClient.setAuthToken).toHaveBeenLastCalledWith(null);
    expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('registers an unauthorized handler with the api client', async () => {
    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(mockedClient.setOnUnauthorized).toHaveBeenCalled());
    const handler = mockedClient.setOnUnauthorized.mock.calls[0][0];
    expect(typeof handler).toBe('function');
  });
});
