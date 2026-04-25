import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';

import ProfileScreen from '@/screens/ProfileScreen';
import * as authService from '@/services/api/auth';
import { renderWithAuth } from '@/test-utils/renderWithAuth';

import type { AuthToken, AuthUser } from '@/types/auth';

jest.mock('@/services/api/auth');
jest.mock('@/services/api/client', () => {
  const actual = jest.requireActual<typeof import('@/services/api/client')>(
    '@/services/api/client',
  );
  return {
    ...actual,
    setAuthToken: jest.fn(),
    setOnUnauthorized: jest.fn(),
  };
});

const mockedAuth = jest.mocked(authService);
const mockedKeychain = jest.mocked(Keychain);

const TOKEN: AuthToken = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  id: 1,
};

const USER: AuthUser = {
  id: 1,
  username: 'emily',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://dummyjson.com/icon/emilyjohnson.png',
};

const navigationStub = {} as React.ComponentProps<typeof ProfileScreen>['navigation'];
const routeStub = { key: 'profile', name: 'Profile' as const, params: undefined } as React.ComponentProps<
  typeof ProfileScreen
>['route'];

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedKeychain.getGenericPassword.mockResolvedValue({
      service: 'loginapp.auth',
      username: 'auth-token',
      password: JSON.stringify(TOKEN),
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    });
    mockedAuth.getMe.mockResolvedValue(USER);
  });

  it('renders the authenticated user and a logout button after data resolves', async () => {
    const { findByText, getByText } = renderWithAuth(
      <ProfileScreen navigation={navigationStub} route={routeStub} />,
    );

    expect(await findByText(`${USER.firstName} ${USER.lastName}`)).toBeTruthy();
    expect(getByText(USER.username)).toBeTruthy();
    expect(getByText(USER.email)).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  it('clears the secure token when the logout button is pressed', async () => {
    const { findByText } = renderWithAuth(
      <ProfileScreen navigation={navigationStub} route={routeStub} />,
    );

    const logoutButton = await findByText('Logout');
    fireEvent.press(logoutButton);

    await waitFor(() => expect(mockedKeychain.resetGenericPassword).toHaveBeenCalled());
  });
});
