import { TOKEN_EXPIRES_IN_MINS } from '@/constants/auth';
import { apiFetch } from '@/services/api/client';

import type { AuthToken, AuthUser, LoginPayload } from '@/types/auth';

/**
 * Sends a login request to the API.
 *
 * @param payload - The login credentials (username and password).
 * @returns A promise that resolves to the authentication token (accessToken and refreshToken).
 * @throws {ApiError} If the login request fails.
 */
export async function login(payload: LoginPayload): Promise<AuthToken> {
  // A 401 here means "wrong credentials", not "session expired" — opt out of
  // the global unauthorized handler so a failed login does not trigger logout.
  return apiFetch<AuthToken>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      expiresInMins: TOKEN_EXPIRES_IN_MINS,
    }),
    skipAuthHandler: true,
  });
}

/**
 * Fetches the current user's profile information.
 * This request requires a valid authentication token to be set in the API client.
 *
 * @returns A promise that resolves to the user's profile data.
 * @throws {ApiError} If the request fails (e.g., unauthorized).
 */
export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me');
}
