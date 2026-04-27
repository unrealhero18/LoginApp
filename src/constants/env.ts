export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_DEV = __DEV__;

export const API_BASE_URL = 'https://dummyjson.com';

/**
 * Session duration requested from the API on login.
 * Note: 1 minute is a demo value for DummyJSON. Increase for production.
 */
export const TOKEN_EXPIRES_IN_MINS = 1;
