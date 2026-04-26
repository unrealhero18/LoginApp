import { cn } from '../styles';

describe('cn utility', () => {
  const styles = {
    base: { padding: 10 },
    active: { backgroundColor: 'blue' },
    disabled: { opacity: 0.5 },
  };

  it('returns an empty array when no inputs are provided', () => {
    expect(cn(styles)).toEqual([]);
  });

  it('returns a single style for a string input', () => {
    expect(cn(styles, 'base')).toEqual([styles.base]);
  });

  it('returns multiple styles for multiple string inputs', () => {
    expect(cn(styles, 'base', 'active')).toEqual([styles.base, styles.active]);
  });

  it('handles conditional object inputs', () => {
    expect(cn(styles, 'base', { active: true, disabled: false })).toEqual([
      styles.base,
      styles.active,
    ]);
    expect(cn(styles, 'base', { active: false, disabled: true })).toEqual([
      styles.base,
      styles.disabled,
    ]);
  });

  it('filters out keys that do not exist in the styles object', () => {
    expect(cn(styles, 'base', 'nonExistent')).toEqual([styles.base]);
  });

  it('handles falsy values in inputs', () => {
    expect(cn(styles, 'base', null, undefined, false, '')).toEqual([styles.base]);
  });

  it('handles nested arrays (standard clsx behavior)', () => {
    expect(cn(styles, ['base', ['active']])).toEqual([styles.base, styles.active]);
  });

  it('handles strings with multiple spaces', () => {
    expect(cn(styles, 'base    active')).toEqual([styles.base, styles.active]);
  });

  it('handles complex combinations of inputs', () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn(styles, 'base', isActive && 'active', isDisabled ? 'disabled' : null, [
        { nonExistent: true },
        'base',
      ])
    ).toEqual([styles.base, styles.active, styles.base]);
  });
});
