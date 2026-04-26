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
    errors.username = 'Username is required';
  } else if (values.username.length < 3) {
    errors.username = 'Username is invalid';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
};
