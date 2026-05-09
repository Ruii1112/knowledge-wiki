import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User, UserUpdateRequest } from '../../../api/schemas';
import { queryKeys } from '../../../lib/queryKeys';
import { usersApi, type UserListParams } from './users';

export function useAdminUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => usersApi.list(params),
  });
}

interface UpdateContext {
  previous: [readonly unknown[], User[] | undefined][];
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation<User, unknown, { userId: number; patch: UserUpdateRequest }, UpdateContext>({
    mutationFn: ({ userId, patch }) => usersApi.update(userId, patch),
    onMutate: async ({ userId, patch }) => {
      // 進行中の同 query を cancel して上書き競合を防ぐ
      await qc.cancelQueries({ queryKey: queryKeys.admin.usersAll });
      const previous = qc.getQueriesData<User[]>({
        queryKey: queryKeys.admin.usersAll,
      });
      qc.setQueriesData<User[]>({ queryKey: queryKeys.admin.usersAll }, (list) =>
        list ? list.map((u) => (u.id === userId ? { ...u, ...patch } : u)) : list,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSuccess: (updated) => {
      qc.setQueriesData<User[]>({ queryKey: queryKeys.admin.usersAll }, (list) =>
        list ? list.map((u) => (u.id === updated.id ? updated : u)) : list,
      );
    },
  });
}
