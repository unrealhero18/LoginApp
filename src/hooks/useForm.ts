import { useState } from 'react';

type UseFormOptions<T> = {
  initialValues: T;
  onSubmit: (values: T) => void;
  onValueChange?: () => void;
  validate?: (values: T) => boolean;
};

/**
 * A reusable hook for managing form state and submission.
 * 
 * @param initialValues - The initial values for the form fields.
 * @param onSubmit - Callback function called when the form is submitted.
 * @param onValueChange - Optional callback called whenever any field value changes.
 * @param validate - Optional function to validate the form values.
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  onValueChange,
  validate,
}: UseFormOptions<T>) {
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

  const setFieldValue = <K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    onValueChange?.();
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  const reset = () => {
    setValues(initialValues);
  };

  const isValid = validate ? validate(values) : true;

  return {
    handleChange,
    handleSubmit,
    isValid,
    reset,
    setFieldValue,
    setValues,
    values,
  };
}
