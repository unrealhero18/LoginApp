import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { getMe } from '@/services/api/auth';
import type { AuthUser } from '@/types/auth';

export function useProfile(): UseQueryResult<AuthUser, Error> {
  const { token } = useAuth();
  return useQuery<AuthUser, Error>({
    queryKey: ['profile'],
    queryFn: getMe,
    enabled: !!token,
  });
}
