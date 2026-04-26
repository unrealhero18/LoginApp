import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';

import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/providers/AuthProvider';
import * as authService from '@/services/api/auth';
import * as client from '@/services/api/client';
import { ApiError } from '@/services/api/client';
import { createTestQueryClient } from '@/test-utils/renderWithAuth';

import type { AuthToken, AuthUser } from '@/types/auth';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(() => jest.fn()),
}));
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
const mockedNetInfo = jest.mocked(require('@react-native-community/netinfo'));

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
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true });
  });

  it('finishes hydration as logged-out when no stored token exists and online', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isOffline).toBe(false);
  });

  it('sets isOffline=true even if no token exists when device is offline', async () => {
    mockedNetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.isOffline).toBe(true);
    expect(result.current.token).toBeNull();
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

  it('clears stored token when hydration getMe returns an ApiError', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue({
      service: 'loginapp.auth',
      username: 'auth-token',
      password: JSON.stringify(TOKEN),
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
    mockedAuth.getMe.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isOffline).toBe(false);
    expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
  });

  it('sets isOffline=true and keeps token when hydration fails with a network error', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue({
      service: 'loginapp.auth',
      username: 'auth-token',
      password: JSON.stringify(TOKEN),
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
    mockedAuth.getMe.mockRejectedValueOnce(new Error('Network request failed'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.isOffline).toBe(true);
    // Token is NOT cleared from secure storage in the offline path
    expect(mockedKeychain.resetGenericPassword).not.toHaveBeenCalled();
    // Component token state is null because setToken() is only called on success
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('retryHydration resets isHydrating, clears isOffline, and resolves session', async () => {
    mockedKeychain.getGenericPassword.mockResolvedValue({
      service: 'loginapp.auth',
      username: 'auth-token',
      password: JSON.stringify(TOKEN),
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
    // First call fails with network error → offline
    mockedAuth.getMe.mockRejectedValueOnce(new Error('Network request failed'));
    // Second call (after retry) succeeds
    mockedAuth.getMe.mockResolvedValueOnce(USER);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isOffline).toBe(true));

    await act(async () => {
      result.current.retryHydration();
    });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.isOffline).toBe(false);
    expect(result.current.token).toEqual(TOKEN);
    expect(result.current.user).toEqual(USER);
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

  it('clears token if getMe fails during login', async () => {
    mockedAuth.login.mockResolvedValue(TOKEN);
    mockedAuth.getMe.mockRejectedValueOnce(new Error('profile fetch failed'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    jest.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      await expect(
        result.current.login({ username: 'emily', password: 'secret' }),
      ).rejects.toThrow('profile fetch failed');
    });
    (console.error as jest.Mock).mockRestore();

    expect(mockedClient.setAuthToken).toHaveBeenLastCalledWith(null);
    expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
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

  it('unauthorized handler stays armed across consecutive incidents', async () => {
    // Regression: previously the `pending` flag was never reset, so the
    // handler triggered logout exactly once per app lifetime. Subsequent
    // 401/403 responses (e.g. after a real session expiry following a failed
    // login) were silently dropped.
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    await waitFor(() => expect(mockedClient.setOnUnauthorized).toHaveBeenCalled());

    const handler = mockedClient.setOnUnauthorized.mock.calls[0][0];
    if (!handler) {
      throw new Error('expected unauthorized handler to be registered');
    }

    await act(async () => {
      handler();
    });
    await waitFor(() =>
      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalledTimes(1),
    );

    await act(async () => {
      handler();
    });
    await waitFor(() =>
      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalledTimes(2),
    );
  });

  it('unauthorized handler deduplicates concurrent invocations within an incident', async () => {
    // Two synchronous calls during the same in-flight logout should result in
    // a single logout — guards against races where queryCache.onError and
    // apiFetch both fire for the same response.
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    await waitFor(() => expect(mockedClient.setOnUnauthorized).toHaveBeenCalled());

    const handler = mockedClient.setOnUnauthorized.mock.calls[0][0];
    if (!handler) {
      throw new Error('expected unauthorized handler to be registered');
    }

    await act(async () => {
      handler();
      handler();
    });
    await waitFor(() =>
      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalledTimes(1),
    );
  });
});
