import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';

import type { LoginPayload } from '@/types/auth';

export function useLogin(): UseMutationResult<void, Error, LoginPayload> {
  const { login } = useAuth();
  return useMutation<void, Error, LoginPayload>({
    mutationFn: payload => login(payload),
  });
}
