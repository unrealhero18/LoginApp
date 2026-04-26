import * as Keychain from 'react-native-keychain';

import { logger } from '@/utils/logger';

import type { AuthToken } from '@/types/auth';

const SERVICE = 'loginapp.auth';
const ACCOUNT = 'auth-token';

function isAuthToken(value: unknown): value is AuthToken {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.accessToken === 'string' &&
    obj.accessToken.length > 0 &&
    typeof obj.refreshToken === 'string' &&
    typeof obj.id === 'number' &&
    Number.isFinite(obj.id) &&
    obj.id > 0
  );
}

/**
 * Persists the authentication token securely using React Native Keychain.
 *
 * `WHEN_UNLOCKED_THIS_DEVICE_ONLY` prevents the token from being included in
 * iCloud Keychain backups or restored to a different device.
 *
 * @param token - The AuthToken object containing access and refresh tokens.
 * @throws {Error} If saving to the keychain fails.
 */
export async function saveToken(token: AuthToken): Promise<void> {
  try {
    await Keychain.setGenericPassword(ACCOUNT, JSON.stringify(token), {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    logger.error('[secureTokenStore] failed to save token', error);
    throw error;
  }
}

/**
 * Retrieves the persisted authentication token from the keychain.
 *
 * @returns The stored AuthToken or null if no token is found, the payload is
 *          malformed, or an error occurs.
 */
export async function loadToken(): Promise<AuthToken | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    if (!credentials) {
      return null;
    }

    const parsed: unknown = JSON.parse(credentials.password);

    if (!isAuthToken(parsed)) {
      logger.warn('[secureTokenStore] stored token failed schema validation');
      return null;
    }

    return parsed;
  } catch (error) {
    logger.error('[secureTokenStore] failed to load token', error);
    return null;
  }
}

/**
 * Removes the persisted authentication token from the keychain.
 *
 * @throws {Error} If clearing the keychain fails.
 */
export async function clearToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch (error) {
    logger.error('[secureTokenStore] failed to clear token', error);
    throw error;
  }
}
