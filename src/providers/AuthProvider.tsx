import React, { useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAuthActions } from '@/hooks/useAuthActions';
import { useHydration } from '@/hooks/useHydration';
import { useTokenExpiry } from '@/hooks/useTokenExpiry';
import { useUnauthorizedHandler } from '@/hooks/useUnauthorizedHandler';
import { AuthContext, type AuthContextValue } from '@/providers/authContext';

import type { AuthToken, AuthUser } from '@/types/auth';

export type { AuthContextValue } from '@/providers/authContext';
export { AuthContext } from '@/providers/authContext';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const tokenRef = useRef<AuthToken | null>(null);
  tokenRef.current = token;

  const { login, logout } = useAuthActions(queryClient, setUser, setToken);
  const { retryHydration } = useHydration(setUser, setToken, setIsHydrating, setIsOffline);
  useUnauthorizedHandler(logout);
  useTokenExpiry(token, tokenRef, logout);

  // useMemo is intentional: prevents consumers from re-rendering on every
  // AuthProvider render when the context value hasn't changed.
  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isHydrating, isOffline, login, logout, retryHydration }),
    [user, token, isHydrating, isOffline, login, logout, retryHydration],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
