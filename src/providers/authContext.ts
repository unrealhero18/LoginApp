import { createContext } from 'react';

import type { AuthToken, AuthUser, LoginPayload } from '@/types/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  token: AuthToken | null;
  isHydrating: boolean;
  isOffline: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  retryHydration: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
