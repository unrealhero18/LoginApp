import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderAPI } from '@testing-library/react-native';

import { AuthProvider } from '@/providers/AuthProvider';
import { queryClient } from '@/providers/queryClient';

export function createTestQueryClient(): QueryClient {
  queryClient.clear();
  return queryClient;
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
