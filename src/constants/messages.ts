export const ErrorMessages = {
  LOGIN_FAILURE: 'User email doesn’t exist.',
  LOGIN_PROFILE_FAILURE: 'Signed in, but failed to load your profile. Please try again.',
  PROFILE_FAILURE: 'Couldn’t load your profile. Please try again.',
  GENERIC: 'Something went wrong. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  SESSION_EXPIRED_TITLE: 'Session Expired',
  FALLBACK_PROFILE_FETCH: 'Profile fetch failed after login',
} as const;

export const AuthMessages = {
  USERNAME_LABEL: 'Username',
  PASSWORD_LABEL: 'Password',
  LOGIN_BUTTON: 'Login',
  LOGOUT_BUTTON: 'Logout',
  RETRY_BUTTON: 'Retry',
  GO_TO_LOGIN_BUTTON: 'Go to login',
} as const;

export const ValidationMessages = {
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_INVALID: 'Username is invalid',
  PASSWORD_REQUIRED: 'Password is required',
} as const;

export const OfflineMessages = {
  TITLE: 'No Internet Connection',
  SESSION_SAVED: 'Your session is saved. Connect to the internet and tap Reconnect to continue.',
  CONNECTION_REQUIRED: 'An internet connection is required to continue. Please connect and tap Reconnect.',
  RECONNECT_BUTTON: 'Reconnect',
} as const;
