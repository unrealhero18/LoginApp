import { type QueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { login as loginRequest } from '@/services/api/auth';
import { setAuthToken } from '@/services/api/client';
import { clearToken, saveToken } from '@/services/storage/secureTokenStore';
import { logger } from '@/utils/logger';

import type { AuthToken, LoginPayload } from '@/types/auth';

export function useAuthActions(
  queryClient: QueryClient,
  setToken: (token: AuthToken | null) => void,
): {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
} {
  // useCallback is intentional: logout is a dep of useUnauthorizedHandler and
  // useTokenExpiry effects, and of the context useMemo — stable ref is required.
  const logout = useCallback(async (): Promise<void> => {
    setAuthToken(null);
    setToken(null);

    // Clear React Query cache to prevent data leakage between users
    queryClient.clear();

    try {
      await clearToken();
    } catch (error) {
      logger.error('[AuthProvider] failed to clear token on logout', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  // useCallback is intentional: login is part of the context value useMemo —
  // stable ref prevents unnecessary consumer re-renders.
  const login = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      const nextToken = await loginRequest(payload);

      setAuthToken(nextToken.accessToken);

      try {
        await saveToken(nextToken);
      } catch (error) {
        logger.error(
          '[AuthProvider] failed to persist token after login',
          error,
        );
      }

      setToken(nextToken);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setToken is a stable useState setter; remaining deps are module-level
    [],
  );

  return { login, logout };
}
