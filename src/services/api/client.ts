import { logger } from '@/utils/logger';

const BASE_URL = 'https://dummyjson.com';

/**
 * Custom error class for API requests.
 * Captures the HTTP status code and the error message from the response.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

async function safeReadMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

/**
 * Updates the access token used for authenticated requests.
 * 
 * @param token - The new JWT access token or null to clear it.
 */
export function setAuthToken(token: string | null): void {
  accessToken = token;
}

/**
 * Sets a callback function to be executed when an unauthorized response (401/403) is received.
 * Used by AuthProvider to trigger a global logout.
 * 
 * @param handler - The callback function or null to remove it.
 */
export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/**
 * A wrapper around the native fetch API that handles:
 * - JSON serialization/deserialization
 * - Common headers (Accept, Content-Type)
 * - Bearer token authentication
 * - Global error handling for 401/403 (unauthorized)
 * - Custom ApiError throwing for non-OK responses
 * 
 * @param path - The API endpoint path (relative to BASE_URL).
 * @param init - Optional fetch configuration (method, body, headers, etc.).
 * @returns A promise that resolves to the parsed JSON response.
 * @throws {ApiError} If the response is not OK.
 * @throws {Error} For network failures or other unexpected errors.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  headers.set('Accept', 'application/json');

  // Automatically set Content-Type if a body is provided
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject the access token if available
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch (error) {
    logger.error('[apiFetch] network error', { path, error });
    throw error;
  }

  // Handle unauthorized responses by triggering the global handler
  if (response.status === 401 || response.status === 403) {
    logger.warn('[apiFetch] unauthorized response', { path, status: response.status });
    onUnauthorized?.();
    const message = await safeReadMessage(response);
    throw new ApiError(response.status, message);
  }

  // Handle other non-OK responses
  if (!response.ok) {
    const message = await safeReadMessage(response);
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
