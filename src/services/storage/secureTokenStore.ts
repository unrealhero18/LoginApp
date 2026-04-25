import * as Keychain from 'react-native-keychain';

import type { AuthToken } from '@/types/auth';
import { logger } from '@/utils/logger';

const SERVICE = 'loginapp.auth';
const ACCOUNT = 'auth-token';

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

export async function loadToken(): Promise<AuthToken | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    if (!credentials) {
      return null;
    }
    return JSON.parse(credentials.password) as AuthToken;
  } catch (error) {
    logger.error('[secureTokenStore] failed to load token', error);
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch (error) {
    logger.error('[secureTokenStore] failed to clear token', error);
    throw error;
  }
}
