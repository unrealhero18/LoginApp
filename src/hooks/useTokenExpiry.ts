import { type RefObject, useEffect } from 'react';
import { Alert, AppState } from 'react-native';

import { ErrorMessages } from '@/constants/messages';
import { getTokenExpiryMs, isTokenExpired } from '@/utils/jwt';
import { logger } from '@/utils/logger';

import type { AuthToken } from '@/types/auth';

export function useTokenExpiry(
  token: AuthToken | null,
  tokenRef: RefObject<AuthToken | null>,
  logout: () => Promise<void>,
): void {
  // Foreground listener: checks expiry when the app returns to active state.
  // Uses tokenRef to read the latest token without re-registering on each change.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') return;

      const currentToken = tokenRef.current;
      if (!currentToken) return;

      if (isTokenExpired(currentToken.accessToken)) {
        logger.info('[AuthProvider] token expired on foreground — logging out');
        Alert.alert(
          ErrorMessages.SESSION_EXPIRED_TITLE,
          ErrorMessages.SESSION_EXPIRED,
        );
        logout().catch(() => {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, [logout, tokenRef]);

  // Expiry timer: schedules a logout exactly when the token expires.
  // Covers the case where the user keeps the app foregrounded past expiry —
  // the AppState listener alone cannot help here because no transition fires.
  // Note: setTimeout is paused while the JS thread sleeps (app backgrounded
  // on iOS). The AppState listener above is the safety net for that case.
  useEffect(() => {
    if (!token) return;

    const expiryMs = getTokenExpiryMs(token.accessToken);
    if (expiryMs === null) return;

    const msUntilExpiry = expiryMs - Date.now();

    if (msUntilExpiry <= 0) {
      logger.info(
        '[AuthProvider] token already expired on schedule — logging out',
      );
      Alert.alert(
        ErrorMessages.SESSION_EXPIRED_TITLE,
        ErrorMessages.SESSION_EXPIRED,
      );
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
        Alert.alert(
          ErrorMessages.SESSION_EXPIRED_TITLE,
          ErrorMessages.SESSION_EXPIRED,
        );
      }

      logout().catch(() => {});
    }, msUntilExpiry);

    return () => clearTimeout(timerId);
  }, [token, logout, tokenRef]);
}
