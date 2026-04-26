import { jwtDecode } from 'jwt-decode';

import { logger } from '@/utils/logger';

export const TOKEN_EXPIRES_IN_MINS = 1;

type JwtPayload = {
  exp?: number;
};

export function isTokenExpired(accessToken: string): boolean {
  if (!accessToken) {
    logger.info('[jwt] empty token — treating as expired');
    return true;
  }

  try {
    const { exp } = jwtDecode<JwtPayload>(accessToken);

    if (exp === undefined) {
      logger.info('[jwt] token has no exp claim — treating as expired');
      return true;
    }

    const expired = exp < Date.now() / 1000;

    if (expired) {
      logger.info('[jwt] stored token is expired');
    }

    return expired;
  } catch {
    logger.info('[jwt] failed to decode token — treating as expired');
    return true;
  }
}

/**
 * Returns the token expiry as a Unix timestamp in milliseconds, or null if
 * the token is malformed, missing the `exp` claim, or empty. Used to schedule
 * a foreground expiry timer; returning null means "do not schedule".
 */
export function getTokenExpiryMs(accessToken: string): number | null {
  if (!accessToken) return null;

  try {
    const { exp } = jwtDecode<JwtPayload>(accessToken);
    if (exp === undefined) return null;
    return exp * 1000;
  } catch {
    return null;
  }
}
