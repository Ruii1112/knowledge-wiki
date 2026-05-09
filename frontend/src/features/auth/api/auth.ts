import {
  LoginResponseSchema,
  UserSchema,
  type LoginRequest,
  type LoginResponse,
  type SignupRequest,
  type User,
} from '../../../api/schemas';
import { api } from '../../../lib/apiClient';

export const authApi = {
  signup: (data: Omit<SignupRequest, 'confirmPassword'>) =>
    api.post<User>(
      '/auth/signup',
      {
        username: data.username,
        email: data.email,
        password: data.password,
      },
      { auth: false, schema: UserSchema },
    ),

  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data, {
      auth: false,
      schema: LoginResponseSchema,
    }),

  me: () => api.get<User>('/auth/me', { schema: UserSchema }),
};
