import { fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';

import LoginScreen from '@/screens/LoginScreen';
import * as authService from '@/services/api/auth';
import { ApiError } from '@/services/api/client';
import { renderWithAuth } from '@/test-utils/renderWithAuth';

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

// Minimal navigation prop stub — the screen does not call into it.
const navigationStub = {} as React.ComponentProps<
  typeof LoginScreen
>['navigation'];
const routeStub = {
  key: 'login',
  name: 'Login' as const,
  params: undefined,
} as React.ComponentProps<typeof LoginScreen>['route'];

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders inputs and does not submit when fields are empty', async () => {
    const { getByLabelText, getByText } = renderWithAuth(
      <LoginScreen navigation={navigationStub} route={routeStub} />,
    );

    expect(getByLabelText('Username')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();

    fireEvent.press(getByText('Login'));

    await waitFor(() => expect(mockedAuth.login).not.toHaveBeenCalled());
  });

  it('shows a generic inline error when the login mutation fails with 401', async () => {
    mockedAuth.login.mockRejectedValue(
      new ApiError(401, 'Invalid credentials'),
    );

    const { getByLabelText, getByText, findByTestId } = renderWithAuth(
      <LoginScreen navigation={navigationStub} route={routeStub} />,
    );

    fireEvent.changeText(getByLabelText('Username'), 'emily');
    fireEvent.changeText(getByLabelText('Password'), 'wrong-password');
    fireEvent.press(getByText('Login'));

    const errorNode = await findByTestId('login-error');
    expect(errorNode).toBeTruthy();
    await waitFor(() => expect(mockedAuth.login).toHaveBeenCalled());
  });
});
