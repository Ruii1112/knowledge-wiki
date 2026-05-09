import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { LoginRequest, User } from '../../../api/schemas';
import { setOnUnauthorized, tokenStorage } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import { useLoginMutation, useMeQuery } from '../api/hooks';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const meQuery = useMeQuery();
  const loginMutation = useLoginMutation();

  const logout = useCallback(() => {
    tokenStorage.clear();
    qc.setQueryData(queryKeys.auth.me, null);
    qc.removeQueries();
  }, [qc]);

  // 認証付きAPIで 401 → 自動 logout
  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation],
  );

  const user = meQuery.data ?? null;
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isInitializing: meQuery.isLoading,
      login,
      logout,
    }),
    [user, meQuery.isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
