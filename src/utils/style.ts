import { type ClassValue, clsx } from 'clsx';
import {
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from 'react-native';

type GenericStyle = ViewStyle | TextStyle | ImageStyle;

export function cn<T extends Record<string, GenericStyle>>(
  styles: T | T[],
  ...inputs: ClassValue[]
): StyleProp<GenericStyle>[] {
  const classNames = clsx(...inputs);
  if (!classNames) return [];

  const styleMaps = Array.isArray(styles) ? styles : [styles];

  return classNames
    .split(' ')
    .filter(Boolean)
    .flatMap(key =>
      styleMaps.map(
        map => (map as Record<string, GenericStyle | undefined>)[key],
      ),
    )
    .filter((v): v is GenericStyle => !!v);
}
