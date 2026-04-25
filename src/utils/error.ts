import { ApiError } from '@/services/api/client';
import { ErrorMessages } from '@/constants/messages';

export const DEFAULT_ERROR_MESSAGE = ErrorMessages.GENERIC;

export function resolveErrorMessage(
  error: Error | null,
  message: string = DEFAULT_ERROR_MESSAGE
): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof ApiError && (error.status === 401 || error.status === 400)) {
    return message;
  }

  return error.message || message;
}
