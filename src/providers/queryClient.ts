import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/services/api/client';
import { IS_TEST } from '@/constants/env';

let onUnauthorizedHandler: (() => void) | null = null;

export function setQueryClientUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorizedHandler = handler;
}

const handleError = (error: unknown): void => {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    onUnauthorizedHandler?.();
  }
};

const getQueryOptions = () => {
  // Time constants in milliseconds
  const STALE_TIME = IS_TEST ? 0 : 1000 * 60 * 5; // 5 minutes
  const GC_TIME = IS_TEST ? 0 : 1000 * 60 * 30; // 30 minutes

  return {
    retry: IS_TEST ? 0 : 2,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: getQueryOptions(),
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
});
