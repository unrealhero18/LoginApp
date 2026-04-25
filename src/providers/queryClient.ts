import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { IS_TEST } from '@/constants/env';
import { ApiError } from '@/services/api/client';

let onUnauthorizedHandler: (() => void) | null = null;

/**
 * Sets a callback function to be executed when a React Query fetch fails with an unauthorized status.
 * 
 * @param handler - The callback function or null to remove it.
 */
export function setQueryClientUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorizedHandler = handler;
}

const handleError = (error: unknown): void => {
  if (
    error instanceof ApiError &&
    !error.skipAuthHandler &&
    (error.status === 401 || error.status === 403)
  ) {
    onUnauthorizedHandler?.();
  }
};

/**
 * Configures default options for queries and mutations.
 * Adjusts settings like retry logic and cache times based on the environment.
 */
const getQueryOptions = () => {
  // Time constants in milliseconds
  // In tests, we disable caching to ensure test isolation
  const STALE_TIME = IS_TEST ? 0 : 1000 * 60 * 5; // 5 minutes
  const GC_TIME = IS_TEST ? 0 : 1000 * 60 * 30; // 30 minutes

  return {
    retry: IS_TEST ? 0 : 2, // Retry failed queries twice in production
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  };
};

/**
 * Global QueryClient instance for the application.
 * Includes centralized error handling for all queries and mutations.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: getQueryOptions(),
    mutations: {
      retry: 0, // Don't retry mutations by default (to avoid duplicate side effects)
    },
  },
  // Global cache callbacks for unified error handling (e.g. logging out on 401)
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
});
