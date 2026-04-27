import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AppState, Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';

import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/providers/AuthProvider';
import * as authService from '@/services/api/auth';
import * as client from '@/services/api/client';
import { ApiError } from '@/services/api/client';
import { createTestQueryClient } from '@/test-utils/renderWithAuth';
import { getTokenExpiryMs, isTokenExpired } from '@/utils/jwt';

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
jest.mock('@/utils/jwt');

const mockedKeychain = jest.mocked(Keychain);
const mockedAuth = jest.mocked(authService);
const mockedClient = jest.mocked(client);
const mockedNetInfo = jest.mocked(require('@react-native-community/netinfo'));
const mockedIsTokenExpired = jest.mocked(isTokenExpired);
const mockedGetTokenExpiryMs = jest.mocked(getTokenExpiryMs);

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

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

let queryClient: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
    mockedKeychain.getGenericPassword.mockResolvedValue(false);
    mockedNetInfo.fetch.mockResolvedValue({ isConnected: true });
    mockedIsTokenExpired.mockReturnValue(false);
    mockedGetTokenExpiryMs.mockReturnValue(null);
  });

  it('finishes hydration as logged-out when no stored token exists and online', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isHydrating).toBe(false));
    expect(result.current.token).toBeNull();
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
    expect(queryClient.getQueryData(['profile'])).toEqual(USER);
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
    expect(queryClient.getQueryData(['profile'])).toEqual(USER);
  });

  it('login persists token and sets token state without calling getMe', async () => {
    mockedAuth.login.mockResolvedValue(TOKEN);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isHydrating).toBe(false));

    await act(async () => {
      await result.current.login({ username: 'emily', password: 'secret' });
    });

    expect(mockedAuth.login).toHaveBeenCalledWith({
      username: 'emily',
      password: 'secret',
    });
    expect(mockedKeychain.setGenericPassword).toHaveBeenCalled();
    expect(mockedClient.setAuthToken).toHaveBeenCalledWith(TOKEN.accessToken);
    expect(result.current.token).toEqual(TOKEN);
    expect(mockedAuth.getMe).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(['profile'])).toBeUndefined();
  });

  it('logout clears state, token storage, and api client token', async () => {
    mockedAuth.login.mockResolvedValue(TOKEN);

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
  });

  it('registers an unauthorized handler with the api client', async () => {
    renderHook(() => useAuth(), { wrapper });

    await waitFor(() =>
      expect(mockedClient.setOnUnauthorized).toHaveBeenCalled(),
    );
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
    await waitFor(() =>
      expect(mockedClient.setOnUnauthorized).toHaveBeenCalled(),
    );

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
    await waitFor(() =>
      expect(mockedClient.setOnUnauthorized).toHaveBeenCalled(),
    );

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

  describe('hydration with JWT expiry check', () => {
    it('clears token without calling getMe when stored token is expired', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValue({
        service: 'loginapp.auth',
        username: 'auth-token',
        password: JSON.stringify(TOKEN),
        storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
      });
      mockedIsTokenExpired.mockReturnValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
      expect(mockedAuth.getMe).not.toHaveBeenCalled();
      expect(result.current.token).toBeNull();
    });

    it('proceeds normally and restores session when stored token is valid', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValue({
        service: 'loginapp.auth',
        username: 'auth-token',
        password: JSON.stringify(TOKEN),
        storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
      });
      mockedAuth.getMe.mockResolvedValue(USER);
      mockedIsTokenExpired.mockReturnValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      expect(mockedAuth.getMe).toHaveBeenCalled();
      expect(result.current.token).toEqual(TOKEN);
      expect(queryClient.getQueryData(['profile'])).toEqual(USER);
    });
  });

  describe('AppState foreground expiry check', () => {
    let appStateChangeHandler: ((nextState: string) => void) | null = null;

    beforeEach(() => {
      jest
        .spyOn(AppState, 'addEventListener')
        .mockImplementation((event, handler) => {
          if (event === 'change') {
            appStateChangeHandler = handler as (nextState: string) => void;
          }
          return { remove: jest.fn() };
        });
    });

    afterEach(() => {
      appStateChangeHandler = null;
    });

    it('triggers logout when token is expired on app foreground', async () => {
      mockedAuth.login.mockResolvedValue(TOKEN);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      expect(result.current.token).toEqual(TOKEN);

      mockedIsTokenExpired.mockReturnValue(true);

      await act(async () => {
        appStateChangeHandler?.('active');
      });

      await waitFor(() => expect(result.current.token).toBeNull());
      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('does not trigger logout when token is valid on app foreground', async () => {
      mockedAuth.login.mockResolvedValue(TOKEN);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      await act(async () => {
        appStateChangeHandler?.('active');
      });

      expect(result.current.token).toEqual(TOKEN);
      expect(mockedKeychain.resetGenericPassword).not.toHaveBeenCalled();
    });

    it('does not trigger logout when app transitions to background', async () => {
      mockedAuth.login.mockResolvedValue(TOKEN);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      mockedIsTokenExpired.mockReturnValue(true);

      await act(async () => {
        appStateChangeHandler?.('background');
      });

      expect(result.current.token).toEqual(TOKEN);
      expect(mockedKeychain.resetGenericPassword).not.toHaveBeenCalled();
    });
  });

  describe('foreground expiry timer', () => {
    it('triggers logout when the scheduled expiry timer fires', async () => {
      const BASE_TIME = 1745625600000;
      jest.setSystemTime(BASE_TIME);

      mockedAuth.login.mockResolvedValue(TOKEN);

      const expiryMs = BASE_TIME + 60_000;
      mockedGetTokenExpiryMs.mockReturnValue(expiryMs);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      expect(result.current.token).toEqual(TOKEN);

      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });

      await waitFor(() => expect(result.current.token).toBeNull());
      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('logs out immediately when token is already expired at schedule time', async () => {
      const BASE_TIME = 1745625600000;
      jest.setSystemTime(BASE_TIME);

      mockedAuth.login.mockResolvedValue(TOKEN);
      mockedGetTokenExpiryMs.mockReturnValue(BASE_TIME - 1_000);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      await waitFor(() => expect(result.current.token).toBeNull());
      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('does not schedule a timer when getTokenExpiryMs returns null', async () => {
      mockedAuth.login.mockResolvedValue(TOKEN);
      mockedGetTokenExpiryMs.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });

      expect(result.current.token).toEqual(TOKEN);
      expect(mockedKeychain.resetGenericPassword).not.toHaveBeenCalled();
    });

    it('clears the scheduled timer when logout runs before it fires', async () => {
      mockedAuth.login.mockResolvedValue(TOKEN);
      mockedGetTokenExpiryMs.mockReturnValue(Date.now() + 60_000);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      await act(async () => {
        await result.current.logout();
      });

      // Advancing time after logout must not produce additional side effects
      // (logout has already cleared the keychain once).
      mockedKeychain.resetGenericPassword.mockClear();

      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });

      expect(mockedKeychain.resetGenericPassword).not.toHaveBeenCalled();
    });

    it('cancels the old timer and arms a new one when the token is replaced', async () => {
      // Verifies the useEffect([token, logout]) dependency: swapping the token
      // must cancel the previous timer and schedule a fresh one. This is the
      // invariant that a future token-refresh flow depends on.
      const BASE_TIME = 1745625600000;
      jest.setSystemTime(BASE_TIME);

      const TOKEN_A: typeof TOKEN = { ...TOKEN, accessToken: 'access-a' };
      const TOKEN_B: typeof TOKEN = { ...TOKEN, accessToken: 'access-b' };

      // TOKEN_A expires in 30 s; TOKEN_B expires in 90 s from BASE_TIME.
      mockedGetTokenExpiryMs
        .mockReturnValueOnce(BASE_TIME + 30_000) // called when TOKEN_A is set
        .mockReturnValueOnce(BASE_TIME + 90_000); // called when TOKEN_B is set

      // First login → TOKEN_A
      mockedAuth.login.mockResolvedValueOnce(TOKEN_A);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isHydrating).toBe(false));

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      expect(result.current.token).toEqual(TOKEN_A);

      // Second login → TOKEN_B (simulates token refresh / re-login)
      mockedAuth.login.mockResolvedValueOnce(TOKEN_B);

      await act(async () => {
        await result.current.login({ username: 'emily', password: 'secret' });
      });

      expect(result.current.token).toEqual(TOKEN_B);

      // Advancing to TOKEN_A's original deadline must NOT trigger logout —
      // the old timer should have been cleared when TOKEN_B replaced TOKEN_A.
      await act(async () => {
        jest.advanceTimersByTime(30_000);
      });

      expect(result.current.token).toEqual(TOKEN_B);
      expect(mockedKeychain.resetGenericPassword).not.toHaveBeenCalled();

      // Advancing to TOKEN_B's deadline MUST trigger logout.
      await act(async () => {
        jest.advanceTimersByTime(60_000); // total 90 s elapsed
      });

      await waitFor(() => expect(result.current.token).toBeNull());
      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled();
    });
  });
});
