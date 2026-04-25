import React from 'react';

import { act, fireEvent, render } from '@testing-library/react-native';

import { LoginForm } from '@/components/auth/LoginForm';
import { ErrorMessages } from '@/constants/messages';
import { ApiError } from '@/services/api/client';
import { LoginProfileFetchError } from '@/utils/error';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnResetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByLabelText, getByText } = render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={null}
        onResetError={mockOnResetError}
      />,
    );

    expect(getByLabelText('Username')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('calls onSubmit when fields are filled and button is pressed', () => {
    const { getByLabelText, getByText } = render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={null}
        onResetError={mockOnResetError}
      />,
    );

    act(() => {
      fireEvent.changeText(getByLabelText('Username'), 'testuser');
      fireEvent.changeText(getByLabelText('Password'), 'password123');
    });

    act(() => {
      fireEvent.press(getByText('Login'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
  });

  it('disables login button when fields are empty', () => {
    const { getByText } = render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={null}
        onResetError={mockOnResetError}
      />,
    );

    const loginButton = getByText('Login');
    act(() => {
      fireEvent.press(loginButton);
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onResetError when input value changes and error exists', () => {
    const { getByLabelText } = render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={new Error('Auth failed')}
        onResetError={mockOnResetError}
      />,
    );

    act(() => {
      fireEvent.changeText(getByLabelText('Username'), 'a');
    });
    expect(mockOnResetError).toHaveBeenCalledTimes(1);
  });

  it('renders LOGIN_FAILURE copy for credential rejections (ApiError)', () => {
    const { getByText } = render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={new ApiError(401, 'Invalid credentials', true)}
        onResetError={mockOnResetError}
      />,
    );

    expect(getByText(ErrorMessages.LOGIN_FAILURE)).toBeTruthy();
  });

  it('renders LOGIN_PROFILE_FAILURE copy when the post-login profile fetch fails', () => {
    const { getByText, queryByText } = render(
      <LoginForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={new LoginProfileFetchError(new Error('boom'))}
        onResetError={mockOnResetError}
      />,
    );

    expect(getByText(ErrorMessages.LOGIN_PROFILE_FAILURE)).toBeTruthy();
    expect(queryByText(ErrorMessages.LOGIN_FAILURE)).toBeNull();
  });
});
