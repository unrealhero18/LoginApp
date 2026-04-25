import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { setQueryClientUnauthorizedHandler } from '@/providers/queryClient';
import { getMe, login as loginRequest } from '@/services/api/auth';
import { setAuthToken, setOnUnauthorized } from '@/services/api/client';
import { clearToken, loadToken, saveToken } from '@/services/storage/secureTokenStore';
import { logger } from '@/utils/logger';

import type { AuthToken, AuthUser, LoginPayload } from '@/types/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  token: AuthToken | null;
  isHydrating: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
    queryClient.clear();
    try {
      await clearToken();
    } catch (error) {
      logger.error('[AuthProvider] failed to clear token on logout', error);
    }
  }, [queryClient]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const nextToken = await loginRequest(payload);
      setAuthToken(nextToken.accessToken);
      try {
        await saveToken(nextToken);
      } catch (error) {
        logger.error('[AuthProvider] failed to persist token after login', error);
      }
      const profile = await getMe();
      setToken(nextToken);
      setUser(profile);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const stored = await loadToken();
      if (cancelled) {
        return;
      }
      if (!stored) {
        setIsHydrating(false);
        return;
      }
      setAuthToken(stored.accessToken);
      try {
        const profile = await getMe();
        if (cancelled) {
          return;
        }
        setToken(stored);
        setUser(profile);
      } catch (error) {
        logger.warn('[AuthProvider] hydration failed; clearing stored token', error);
        setAuthToken(null);
        try {
          await clearToken();
        } catch (clearError) {
          logger.error('[AuthProvider] failed to clear token after hydration error', clearError);
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = (): void => {
      void logout();
    };
    setOnUnauthorized(handler);
    setQueryClientUnauthorizedHandler(handler);
    return () => {
      setOnUnauthorized(null);
      setQueryClientUnauthorizedHandler(null);
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isHydrating, login, logout }),
    [user, token, isHydrating, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
