import { useState } from 'react';

type UseFormOptions<T> = {
  initialValues: T;
  onSubmit: (values: T) => void;
  onValueChange?: () => void;
  validate?: (values: T) => boolean;
};

type UseFormReturn<T> = {
  values: T;
  handleChange: <K extends keyof T>(name: K) => (value: T[K]) => void;
  handleSubmit: () => void;
  isValid: boolean;
};

/**
 * Minimal form-state hook covering controlled inputs, change notification, and
 * a synchronous validity flag. Intentionally narrow — extend only when a
 * second consumer demands it.
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  onValueChange,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange =
    <K extends keyof T>(name: K) =>
      (value: T[K]) => {
        setValues((prev) => ({
          ...prev,
          [name]: value,
        }));
        onValueChange?.();
      };

  const handleSubmit = () => {
    onSubmit(values);
  };

  const isValid = validate ? validate(values) : true;

  return {
    handleChange,
    handleSubmit,
    isValid,
    values,
  };
}
