import { useEffect } from 'react';

import { setQueryClientUnauthorizedHandler } from '@/providers/queryClient';
import { setOnUnauthorized } from '@/services/api/client';

export function useUnauthorizedHandler(logout: () => Promise<void>): void {
  useEffect(() => {
    // The `pending` flag deduplicates concurrent invocations within a single
    // unauthorized incident (e.g. queryCache + apiFetch firing for the same
    // response). It MUST reset once `logout()` settles — otherwise the handler
    // latches permanently after the first call and subsequent session
    // expirations would be silently dropped.
    let pending = false;
    const handler = (): void => {
      if (pending) return;
      pending = true;
      // .catch silences the rejection that .finally re-throws if logout() rejects
      logout()
        .finally(() => {
          pending = false;
        })
        .catch(() => {});
    };

    setOnUnauthorized(handler);
    setQueryClientUnauthorizedHandler(handler);

    return () => {
      setOnUnauthorized(null);
      setQueryClientUnauthorizedHandler(null);
    };
  }, [logout]);
}
