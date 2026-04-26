import { useState } from 'react';
import { Keyboard } from 'react-native';

import { logger } from '@/utils/logger';

import type { FormErrors } from '@/types/form';

type UseFormOptions<T> = {
  initialValues: T;
  onSubmit: (values: T) => void;
  onValueChange?: () => void;
  validate?: (values: T) => FormErrors<T>;
  error?: unknown;
  onResetError?: () => void;
};

type UseFormReturn<T> = {
  values: T;
  errors: FormErrors<T>;
  handleChange: <K extends keyof T>(name: K) => (value: T[K]) => void;
  handleSubmit: () => void;
  isValid: boolean;
  isComplete: boolean;
  reset: () => void;
  resetErrors: () => void;
};

/**
 * Enhanced form-state hook covering controlled inputs, change notification,
 * per-field error tracking, and validation on submit.
 *
 * Error-clearing happens synchronously inside `handleChange` so that no
 * `useEffect` or stale-closure risk is introduced.
 */
export function useForm<T extends Record<string, unknown>>({
  error,
  initialValues,
  onResetError,
  onSubmit,
  onValueChange,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const validationResult = validate?.(values) ?? {};
  const isValid = !Object.values(validationResult).some(Boolean);
  const isComplete = Object.values(values).every(
    v => v !== '' && v !== null && v !== undefined,
  );

  const handleChange =
    <K extends keyof T>(name: K) =>
    (value: T[K]) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // Clear the per-field error for this field synchronously so there is
      // no stale-closure risk and no cursor-reset side-effects from effects.
      setErrors(prev => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });

      onValueChange?.();

      // Clear any global API error passed in from the parent.
      if (error) onResetError?.();
    };

  const resetErrors = () => setErrors({});

  const handleSubmit = () => {
    if (!isValid) {
      logger.debug('[useForm] validation failed', validationResult);
      setErrors(validationResult);
      return;
    }

    resetErrors();
    Keyboard.dismiss();
    onSubmit(values);
  };

  const reset = () => {
    setValues(initialValues);
    resetErrors();
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    isValid,
    isComplete,
    reset,
    resetErrors,
  };
}
