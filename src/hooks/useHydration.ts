import { useCallback, useEffect } from 'react';

import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

import { ErrorMessages } from '@/constants/messages';
import { getMe } from '@/services/api/auth';
import { ApiError, setAuthToken } from '@/services/api/client';
import { clearToken, loadToken } from '@/services/storage/secureTokenStore';
import { isTokenExpired } from '@/utils/jwt';
import { logger } from '@/utils/logger';

import type { AuthToken, AuthUser } from '@/types/auth';

export function useHydration(
  setUser: (user: AuthUser | null) => void,
  setToken: (token: AuthToken | null) => void,
  setIsHydrating: (value: boolean) => void,
  setIsOffline: (value: boolean) => void,
): {
  retryHydration: () => void;
} {
  // useCallback with [] is intentional: state setters are guaranteed stable by
  // React, so hydrate itself is stable — required as a dep of the startup effect
  // and retryHydration.
  const hydrate = useCallback(async (cancelledRef?: { value: boolean }): Promise<void> => {
    let stored: AuthToken | null = null;
    try {
      stored = await loadToken();
    } catch (error) {
      logger.error('[AuthProvider] failed to load token during hydration', error);
    }
    if (cancelledRef?.value) return;

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

    setAuthToken(stored.accessToken);

    try {
      const profile = await getMe();
      if (cancelledRef?.value) return;

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

  // useCallback is intentional: retryHydration is part of the context value
  // useMemo — stable ref prevents unnecessary consumer re-renders.
  const retryHydration = useCallback((): void => {
    setIsHydrating(true);
    setIsOffline(false);
    hydrate().catch(() => {});
  }, [hydrate, setIsHydrating, setIsOffline]);

  useEffect(() => {
    const cancelledRef = { value: false };

    hydrate(cancelledRef).catch(() => {});

    return () => {
      cancelledRef.value = true;
    };
  }, [hydrate]);

  return { retryHydration };
}
