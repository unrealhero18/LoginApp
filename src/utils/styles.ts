import { type ClassValue, clsx } from 'clsx';

// Returns any[] to avoid "No overload matches" errors on mixed ViewStyle | TextStyle components.
export function cn<T extends Record<string, any>>(
  styles: T,
  ...inputs: ClassValue[]
): any[] {
  const classNames = clsx(...inputs);
  if (!classNames) return [];

  return classNames
    .split(' ')
    .filter(Boolean)
    .map((key) => styles[key as keyof T])
    .filter((style): style is T[keyof T] => !!style);
}
