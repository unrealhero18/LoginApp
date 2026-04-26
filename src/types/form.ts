/**
 * Per-field error map for any form type T.
 * A key is present and non-undefined when that field has a validation error.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;
