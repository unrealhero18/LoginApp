/**
 * Interpolates placeholders in a string with values from an object.
 * Placeholders should be in the format {key}.
 *
 * @param template - The string template with placeholders.
 * @param values - An object containing keys and values for interpolation.
 * @returns The interpolated string.
 *
 * @example
 * interpolate('Hello, {name}!', { name: 'World' }); // 'Hello, World!'
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return String(values[key] ?? match);
  });
}
