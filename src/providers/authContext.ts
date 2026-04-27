import { createContext } from 'react';

import type { AuthToken, LoginPayload } from '@/types/auth';

export type AuthContextValue = {
  token: AuthToken | null;
  isHydrating: boolean;
  isOffline: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  retryHydration: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
