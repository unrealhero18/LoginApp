import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/services/api/client';

let onUnauthorizedHandler: (() => void) | null = null;

export function setQueryClientUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorizedHandler = handler;
}

const handleError = (error: unknown): void => {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    onUnauthorizedHandler?.();
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
});
