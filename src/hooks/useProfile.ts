import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { getMe } from '@/services/api/auth';

import type { AuthUser } from '@/types/auth';

export function useProfile(): UseQueryResult<AuthUser, Error> {
  const { token } = useAuth();
  return useQuery<AuthUser, Error>({
    queryKey: QUERY_KEYS.profile,
    queryFn: getMe,
    enabled: !!token,
  });
}
