import { ValidationMessages } from '@/constants/messages';
import type { LoginPayload } from '@/types/auth';
import type { FormErrors } from '@/types/form';

/**
 * Validation rules for the login form.
 *
 * Errors are only shown to the user on submit — the Login button is gated
 * separately by `isComplete` (all fields non-empty) inside `useForm`.
 */
export const validateLogin = (values: LoginPayload): FormErrors<LoginPayload> => {
  const errors: FormErrors<LoginPayload> = {};

  if (!values.username) {
    errors.username = ValidationMessages.USERNAME_REQUIRED;
  } else if (values.username.length < 3) {
    errors.username = ValidationMessages.USERNAME_INVALID;
  }

  if (!values.password) {
    errors.password = ValidationMessages.PASSWORD_REQUIRED;
  }

  return errors;
};
