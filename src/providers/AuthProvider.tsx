import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { AppState, Alert } from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';

import { ErrorMessages } from '@/constants/messages';
import { setQueryClientUnauthorizedHandler } from '@/providers/queryClient';
import { getMe, login as loginRequest } from '@/services/api/auth';
import { ApiError, setAuthToken, setOnUnauthorized } from '@/services/api/client';
import { clearToken, loadToken, saveToken } from '@/services/storage/secureTokenStore';
import { LoginProfileFetchError } from '@/utils/error';
import { getTokenExpiryMs, isTokenExpired } from '@/utils/jwt';
import { logger } from '@/utils/logger';

import type { AuthToken, AuthUser, LoginPayload } from '@/types/auth';

/**
 * Shape of the authentication context provided to the application.
 */
export type AuthContextValue = {
  user: AuthUser | null;
  token: AuthToken | null;
  isHydrating: boolean;
  isOffline: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  retryHydration: () => void;
};

/**
 * Context used to share authentication state across the component tree.
 * Use the `useAuth` hook to access this context.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

/**
 * AuthProvider component that manages the authentication lifecycle.
 * It handles:
 * 1. Session hydration (restoring token from Keychain on startup).
 * 2. Login/Logout actions.
 * 3. Syncing the API client and QueryClient with the auth state.
 * 4. Handling global unauthorized (401/403) events.
 * 5. Detecting network failures during hydration and surfacing offline state.
 */
export function AuthProvider({ children }: Props) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const tokenRef = useRef<AuthToken | null>(null);
  tokenRef.current = token;

  /**
   * Logs out the user by clearing state, storage, and the query cache.
   * Note: useCallback is used intentionally here to avoid unnecessary context re-renders.
   */
  const logout = useCallback(async (): Promise<void> => {
    // 1. Clear memory state
    setAuthToken(null);
    setUser(null);
    setToken(null);

    // 2. Clear React Query cache to prevent data leakage between users
    queryClient.clear();

    // 3. Clear persistent storage
    try {
      await clearToken();
    } catch (error) {
      logger.error('[AuthProvider] failed to clear token on logout', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  /**
   * Performs the login operation:
   * 1. Calls the login API.
   * 2. Saves the token to secure storage.
   * 3. Fetches the user profile.
   * 4. Updates the local state.
   * Note: useCallback is used intentionally here to avoid unnecessary context re-renders.
   */
  const login = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      // Fetch new tokens
      const nextToken = await loginRequest(payload);

      // Update API client immediately
      setAuthToken(nextToken.accessToken);

      // Persist tokens for future sessions
      try {
        await saveToken(nextToken);
      } catch (error) {
        logger.error('[AuthProvider] failed to persist token after login', error);
      }

      // Fetch user profile using the new token
      try {
        const profile = await getMe();
        // Finalize state update
        setToken(nextToken);
        setUser(profile);
      } catch (error) {
        logger.error('[AuthProvider] profile fetch failed after login; clearing token', error);
        setAuthToken(null);
        // Wrap clearToken in its own try/catch so a Keychain failure here
        // never masks the original profile-fetch error.
        try {
          await clearToken();
        } catch (clearError) {
          logger.error('[AuthProvider] failed to clear token after profile fetch failure', clearError);
        }
        throw new LoginProfileFetchError(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * Core hydration logic — loads the stored token and verifies the session
   * via getMe(). Accepts an optional cancellation ref so the initial mount
   * effect can abort in-flight work when the component unmounts.
   *
   * Error handling:
   * - ApiError (401/403): token is invalid/expired → clear everything.
   * - Any other error: network unreachable → preserve token, set isOffline=true.
   */
  const hydrate = useCallback(async (cancelledRef?: { value: boolean }): Promise<void> => {
    // 1. Attempt to load token from Keychain
    const stored = await loadToken();
    if (cancelledRef?.value) return;

    // 2. Check network status before attempting any API calls.
    // This ensures that even on a fresh install (no token), we can detect
    // an offline state if the app requires a connection to proceed.
    const networkState = await NetInfo.fetch();
    if (cancelledRef?.value) return;

    if (!networkState.isConnected) {
      logger.info('[AuthProvider] hydration: device is offline');
      setIsOffline(true);
      setIsHydrating(false);
      return;
    }

    if (!stored) {
      setIsHydrating(false);
      return;
    }

    // 3. Reject expired tokens before making any network call
    if (isTokenExpired(stored.accessToken)) {
      logger.info('[AuthProvider] stored token expired on hydration — clearing session');
      try {
        await clearToken();
      } catch (clearError) {
        logger.error('[AuthProvider] failed to clear expired token on hydration', clearError);
      }
      // Note: We omit Alert.alert here because the app hasn't rendered yet.
      // Silently dropping to the login screen is less jarring than a popup
      // before the first frame.
      setIsHydrating(false);
      return;
    }

    // 4. Set token in API client for subsequent requests
    setAuthToken(stored.accessToken);

    try {
      // 5. Verify session by fetching user profile
      const profile = await getMe();
      if (cancelledRef?.value) return;

      // 6. Update state with restored session
      setToken(stored);
      setUser(profile);
    } catch (error) {
      if (cancelledRef?.value) return;

      if (error instanceof ApiError) {
        logger.info('[AuthProvider] hydration failed; clearing stored token', error);
        Alert.alert(ErrorMessages.SESSION_EXPIRED_TITLE, ErrorMessages.SESSION_EXPIRED);
        setAuthToken(null);
        setIsOffline(false);
        try {
          await clearToken();
        } catch (clearError) {
          logger.error('[AuthProvider] failed to clear token after hydration error', clearError);
        }
      } else {
        // Network failure — device is offline; keep token for retry
        logger.info('[AuthProvider] getMe failed with network error; staying offline', error);
        setIsOffline(true);
      }
    } finally {
      if (!cancelledRef?.value) {
        setIsHydrating(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Re-runs hydration after the user presses "Reconnect".
   * Resets both loading and offline flags before re-attempting.
   * Note: useCallback is used intentionally here to avoid unnecessary context re-renders.
   */
  const retryHydration = useCallback((): void => {
    setIsHydrating(true);
    setIsOffline(false);
    hydrate().catch(() => {});
  }, [hydrate]);

  /**
   * Effect to restore the authentication session on app launch.
   */
  useEffect(() => {
    const cancelledRef = { value: false };

    hydrate(cancelledRef).catch(() => {});

    return () => {
      cancelledRef.value = true;
    };
  }, [hydrate]);

  /**
   * Effect to register global unauthorized handlers.
   * If any API request (via fetch or React Query) returns 401/403,
   * this will trigger an automatic logout.
   *
   * The `pending` flag deduplicates concurrent invocations within a single
   * unauthorized incident (e.g. queryCache + apiFetch firing for the same
   * response). It MUST reset once `logout()` settles — otherwise the handler
   * latches permanently after the first call and subsequent session
   * expirations would be silently dropped.
   */
  useEffect(() => {
    let pending = false;
    const handler = (): void => {
      if (pending) return;
      pending = true;
      logout().finally(() => {
        pending = false;
      }).catch(() => {});
    };

    setOnUnauthorized(handler);
    setQueryClientUnauthorizedHandler(handler);

    return () => {
      setOnUnauthorized(null);
      setQueryClientUnauthorizedHandler(null);
    };
  }, [logout]);

  /**
   * Effect to check JWT expiry when the app returns to the foreground.
   * Uses a ref to read the latest token without the effect re-registering on every token change.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') return;

      const currentToken = tokenRef.current;
      if (!currentToken) return;

      if (isTokenExpired(currentToken.accessToken)) {
        logger.info('[AuthProvider] token expired on foreground — logging out');
        Alert.alert(ErrorMessages.SESSION_EXPIRED_TITLE, ErrorMessages.SESSION_EXPIRED);
        logout().catch(() => {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, [logout]);

  /**
   * Effect to schedule a logout exactly when the current token expires.
   * Covers the case where the user keeps the app foregrounded past expiry —
   * the AppState listener alone cannot help here because no transition fires.
   *
   * Note: setTimeout is paused while the JS thread sleeps (app backgrounded
   * on iOS). The AppState listener above is the safety net for that case.
   */
  useEffect(() => {
    if (!token) return;

    const expiryMs = getTokenExpiryMs(token.accessToken);
    if (expiryMs === null) return;

    const msUntilExpiry = expiryMs - Date.now();

    if (msUntilExpiry <= 0) {
      logger.info('[AuthProvider] token already expired on schedule — logging out');
      Alert.alert(ErrorMessages.SESSION_EXPIRED_TITLE, ErrorMessages.SESSION_EXPIRED);
      logout().catch(() => {});
      return;
    }

    const timerId = setTimeout(() => {
      // Guard: if logout already ran (e.g. via the 401 handler or AppState
      // listener), tokenRef.current will be null — skip to avoid a double-logout.
      if (!tokenRef.current) return;
      logger.info('[AuthProvider] token expiry timer fired — logging out');

      // Only show the alert if the app is currently in the foreground.
      // If backgrounded, the AppState listener will handle the alert on foreground.
      if (AppState.currentState === 'active') {
        Alert.alert(ErrorMessages.SESSION_EXPIRED_TITLE, ErrorMessages.SESSION_EXPIRED);
      }

      logout().catch(() => {});
    }, msUntilExpiry);

    return () => clearTimeout(timerId);
  }, [token, logout]);

  // Note: useMemo is intentionally used here to prevent consumers from
  // re-rendering on every AuthProvider render.
  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isHydrating, isOffline, login, logout, retryHydration }),
    [user, token, isHydrating, isOffline, login, logout, retryHydration],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
