import { ErrorMessages } from '@/constants/messages';
import { ApiError } from '@/services/api/client';

export const DEFAULT_ERROR_MESSAGE = ErrorMessages.GENERIC;

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
