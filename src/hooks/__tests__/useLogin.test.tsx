import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useLogin } from '@/hooks/useLogin';
import { AuthProvider } from '@/providers/AuthProvider';
import * as authService from '@/services/api/auth';
import { createTestQueryClient } from '@/test-utils/renderWithAuth';

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

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves successfully and exposes idle pending state by default', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.error).toBeNull();
  });

  it('marks pending while login is in flight and clears it on success', async () => {
    mockedAuth.login.mockResolvedValue(TOKEN);
    mockedAuth.getMe.mockResolvedValue(USER);

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate({ username: 'emily', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedAuth.login).toHaveBeenCalledWith({
      username: 'emily',
      password: 'secret',
    });
  });

  it('exposes error when the underlying login fails', async () => {
    const failure = new Error('Invalid credentials');
    mockedAuth.login.mockRejectedValue(failure);

    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate({ username: 'emily', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(failure);
  });
});
