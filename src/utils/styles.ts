import { type ClassValue, clsx } from 'clsx';
import {
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from 'react-native';

type GenericStyle = ViewStyle | TextStyle | ImageStyle;

export function cn<T extends Record<string, GenericStyle>>(
  styles: T,
  ...inputs: ClassValue[]
): StyleProp<GenericStyle>[] {
  const classNames = clsx(...inputs);
  if (!classNames) return [];

  return classNames
    .split(' ')
    .filter(Boolean)
    .map(key => styles[key as keyof T])
    .filter((style): style is T[keyof T] => !!style);
}
