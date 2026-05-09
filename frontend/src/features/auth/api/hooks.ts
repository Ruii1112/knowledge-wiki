import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginRequest, User } from '../../../api/schemas';
import { ApiError, tokenStorage } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import type { SignupFormValues } from '../schemas';
import { authApi } from './auth';

// /auth/me で現在の user を取得 (token がなければ実行しない)
// 401 のみ token を消す。net error 等は rethrow して TanStack Query の retry/error 表示に委ねる。
export function useMeQuery() {
  return useQuery<User | null>({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      if (!tokenStorage.get()) return null;
      try {
        const me = await authApi.me();
        if (!me.enabled) {
          tokenStorage.clear();
          return null;
        }
        return me;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          tokenStorage.clear();
          return null;
        }
        throw err;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { token } = await authApi.login(credentials);
      tokenStorage.set(token);
      const me = await authApi.me();
      if (!me.enabled) {
        tokenStorage.clear();
        throw new Error('アカウントが無効化されています');
      }
      return me;
    },
    onSuccess: (me) => {
      qc.setQueryData(queryKeys.auth.me, me);
    },
    onError: () => {
      tokenStorage.clear();
    },
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (data: SignupFormValues) =>
      authApi.signup({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
  });
}
