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
  return apiFetch<AuthToken>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
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
