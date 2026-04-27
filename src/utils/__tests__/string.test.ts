import { interpolate } from '../string';

describe('interpolate', () => {
  it('replaces single placeholder', () => {
    expect(interpolate('Hello, {name}!', { name: 'Alice' })).toBe('Hello, Alice!');
  });

  it('replaces multiple placeholders', () => {
    expect(interpolate('{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' })).toBe('Hi, Bob!');
  });

  it('leaves missing placeholders as is', () => {
    expect(interpolate('Hello, {name} {missing}!', { name: 'Alice' })).toBe('Hello, Alice {missing}!');
  });

  it('handles numbers', () => {
    expect(interpolate('Count: {count}', { count: 42 })).toBe('Count: 42');
  });
});
