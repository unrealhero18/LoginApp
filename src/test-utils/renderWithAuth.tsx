import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderAPI } from '@testing-library/react-native';

import { AuthProvider } from '@/providers/AuthProvider';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

type WrapperOptions = {
  queryClient?: QueryClient;
};

export function renderWithAuth(
  ui: React.ReactElement,
  { queryClient, ...renderOptions }: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
): RenderAPI & { queryClient: QueryClient } {
  const client = queryClient ?? createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  const utils = render(ui, { wrapper: Wrapper, ...renderOptions });
  return { ...utils, queryClient: client };
}
