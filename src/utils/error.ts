import { ErrorMessages } from '@/constants/messages';
import { ApiError } from '@/services/api/client';

export const DEFAULT_ERROR_MESSAGE = ErrorMessages.GENERIC;

/**
 * Thrown when the post-login profile fetch fails. Distinct from a credential
 * rejection so the UI can display the right copy. The original failure is
 * forwarded via the standard ES2022 `Error.cause` channel for tooling that
 * walks cause chains.
 */
export class LoginProfileFetchError extends Error {
  constructor(cause: unknown) {
    const message =
      cause instanceof Error && cause.message
        ? cause.message
        : ErrorMessages.FALLBACK_PROFILE_FETCH;
    super(message, { cause });
    this.name = 'LoginProfileFetchError';
  }
}

export function resolveErrorMessage(
  error: Error | null,
  message: string = DEFAULT_ERROR_MESSAGE
): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof ApiError) {
    return message;
  }

  return error.message || message;
}

/**
 * Resolves the user-facing copy for a login attempt failure. Distinguishes a
 * post-auth profile-fetch failure (`LoginProfileFetchError`) from a credential
 * rejection so the UI can show accurate copy without leaking technical detail.
 */
export function getLoginErrorMessage(error: Error | null): string | null {
  if (error instanceof LoginProfileFetchError) {
    return ErrorMessages.LOGIN_PROFILE_FAILURE;
  }
  return resolveErrorMessage(error, ErrorMessages.LOGIN_FAILURE);
}
