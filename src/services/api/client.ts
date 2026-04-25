import { logger } from '@/utils/logger';

const BASE_URL = 'https://dummyjson.com';

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

export function setAuthToken(token: string | null): void {
  accessToken = token;
}

export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
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

  if (response.status === 401 || response.status === 403) {
    logger.warn('[apiFetch] unauthorized response', { path, status: response.status });
    onUnauthorized?.();
    const message = await safeReadMessage(response);
    throw new ApiError(response.status, message);
  }

  if (!response.ok) {
    const message = await safeReadMessage(response);
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}
