jest.unmock('@/utils/jwt');

import { getTokenExpiryMs, isTokenExpired } from '../jwt';

const b64url = (data: string) =>
  btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

const HEADER = b64url('{"alg":"HS256","typ":"JWT"}');

const makeJwt = (payload: object) =>
  `${HEADER}.${b64url(JSON.stringify(payload))}.fakesig`;

const NOW_S = 1745625600; // 2026-04-26T00:00:00.000Z in seconds

describe('isTokenExpired', () => {
  beforeEach(() => {
    jest.setSystemTime(new Date(NOW_S * 1000));
  });

  it('returns true for an expired token', () => {
    const token = makeJwt({ exp: NOW_S - 60 });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns false for a valid token', () => {
    const token = makeJwt({ exp: NOW_S + 3600 });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('returns true for a token without an exp claim', () => {
    const token = makeJwt({ sub: 'user-1' });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('returns true for a malformed string', () => {
    expect(isTokenExpired('not-a-valid-jwt')).toBe(true);
  });

  it('returns true for an empty string', () => {
    expect(isTokenExpired('')).toBe(true);
  });
});

describe('getTokenExpiryMs', () => {
  it('returns the exp claim converted to milliseconds', () => {
    const token = makeJwt({ exp: NOW_S + 60 });
    expect(getTokenExpiryMs(token)).toBe((NOW_S + 60) * 1000);
  });

  it('returns null for a token without an exp claim', () => {
    const token = makeJwt({ sub: 'user-1' });
    expect(getTokenExpiryMs(token)).toBeNull();
  });

  it('returns null for a malformed string', () => {
    expect(getTokenExpiryMs('not-a-valid-jwt')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(getTokenExpiryMs('')).toBeNull();
  });
});
