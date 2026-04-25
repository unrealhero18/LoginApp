import { apiFetch } from '@/services/api/client';
import type { AuthToken, AuthUser, LoginPayload } from '@/types/auth';

export async function login(payload: LoginPayload): Promise<AuthToken> {
  return apiFetch<AuthToken>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me');
}
