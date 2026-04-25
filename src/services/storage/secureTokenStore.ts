import * as Keychain from 'react-native-keychain';

import { logger } from '@/utils/logger';

import type { AuthToken } from '@/types/auth';

const SERVICE = 'loginapp.auth';
const ACCOUNT = 'auth-token';

/**
 * Persists the authentication token securely using React Native Keychain.
 * 
 * @param token - The AuthToken object containing access and refresh tokens.
 * @throws {Error} If saving to the keychain fails.
 */
export async function saveToken(token: AuthToken): Promise<void> {
  try {
    await Keychain.setGenericPassword(ACCOUNT, JSON.stringify(token), {
      service: SERVICE,
    });
  } catch (error) {
    logger.error('[secureTokenStore] failed to save token', error);
    throw error;
  }
}

/**
 * Retrieves the persisted authentication token from the keychain.
 * 
 * @returns The stored AuthToken or null if no token is found or an error occurs.
 */
export async function loadToken(): Promise<AuthToken | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    if (!credentials) {
      return null;
    }
    // Parse the JSON string stored in the password field
    return JSON.parse(credentials.password) as AuthToken;
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
