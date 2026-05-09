import {
  UserListSchema,
  UserSchema,
  type User,
  type UserUpdateRequest,
} from '../../../api/schemas';
import { api } from '../../../lib/apiClient';

export interface UserListParams {
  page?: number;
  size?: number;
}

export const usersApi = {
  list: (params: UserListParams = {}) =>
    api.get<User[]>('/admin/users', {
      query: { ...params },
      schema: UserListSchema,
    }),
  update: (userId: number, body: UserUpdateRequest) =>
    api.patch<User>(`/admin/users/${userId}`, body, { schema: UserSchema }),
};
