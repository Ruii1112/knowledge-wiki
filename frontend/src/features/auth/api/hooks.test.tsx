import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenStorage } from '../../../lib/apiClient';
import { server } from '../../../test/setup';
import { createTestQueryClient } from '../../../test/utils';
import { useLoginMutation, useMeQuery } from './hooks';

const API = 'http://localhost:8080/api';

function makeWrapper() {
  const qc = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

describe('useMeQuery', () => {
  it('token がなければ /auth/me を呼ばずに null を返す', async () => {
    // /auth/me が呼ばれたら fail。早期 return が削除されると test が fail する
    let called = false;
    server.use(
      http.get(`${API}/auth/me`, () => {
        called = true;
        return HttpResponse.json({ message: 'should not be called' }, { status: 500 });
      }),
    );
    const { result } = renderHook(() => useMeQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(called).toBe(false);
    expect(result.current.data).toBeNull();
  });
});

describe('useLoginMutation', () => {
  it('admin でログインすると user を返し token を保存', async () => {
    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: makeWrapper(),
    });
    const me = await result.current.mutateAsync({
      username: 'admin',
      password: 'password',
    });
    expect(tokenStorage.get()).not.toBeNull();
    expect(me.username).toBe('admin');
    expect(me.role).toBe('ADMIN');
  });

  it('誤資格情報で ApiError', async () => {
    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: makeWrapper(),
    });
    await expect(
      result.current.mutateAsync({ username: 'admin', password: 'wrong' }),
    ).rejects.toThrow();
    expect(tokenStorage.get()).toBeNull();
  });

  it('無効化済ユーザー (user2) を 401 として扱う', async () => {
    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: makeWrapper(),
    });
    await expect(
      result.current.mutateAsync({ username: 'user2', password: 'password' }),
    ).rejects.toThrow();
  });
});
