import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenStorage } from '../../../lib/apiClient';
import { queryKeys } from '../../../lib/queryKeys';
import { server } from '../../../test/setup';
import { createTestQueryClient } from '../../../test/utils';
import { authApi } from '../../auth/api/auth';
import { useAdminUsersQuery, useUpdateUserMutation } from './hooks';

const API = 'http://localhost:8080/api';

function makeProviders() {
  const qc = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, wrapper };
}

async function loginAsAdmin() {
  const { token } = await authApi.login({
    username: 'admin',
    password: 'password',
  });
  tokenStorage.set(token);
}

describe('useAdminUsersQuery', () => {
  it('管理者で取得成功', async () => {
    await loginAsAdmin();
    const { wrapper } = makeProviders();
    const { result } = renderHook(() => useAdminUsersQuery({ page: 0, size: 20 }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });
});

describe('useUpdateUserMutation', () => {
  it('成功時に該当 user の cache を更新', async () => {
    await loginAsAdmin();
    const { qc, wrapper } = makeProviders();
    // 先に list を fetch
    const { result: listResult } = renderHook(() => useAdminUsersQuery({ page: 0, size: 20 }), {
      wrapper,
    });
    await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

    const { result } = renderHook(() => useUpdateUserMutation(), { wrapper });
    await result.current.mutateAsync({ userId: 2, patch: { enabled: false } });

    const cached = qc.getQueryData<{ id: number; enabled: boolean }[]>(
      queryKeys.admin.users({ page: 0, size: 20 }),
    );
    expect(cached?.find((u) => u.id === 2)?.enabled).toBe(false);
  });

  it('楽観更新 → 失敗 → ロールバック の3段階を確認', async () => {
    await loginAsAdmin();
    const { qc, wrapper } = makeProviders();
    const { result: listResult } = renderHook(() => useAdminUsersQuery({ page: 0, size: 20 }), {
      wrapper,
    });
    await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

    const queryKey = queryKeys.admin.users({ page: 0, size: 20 });
    const initialEnabled = qc
      .getQueryData<{ id: number; enabled: boolean }[]>(queryKey)
      ?.find((u) => u.id === 2)?.enabled;
    expect(initialEnabled).toBe(true); // user1 の初期状態

    // PATCH を 50ms 遅延 + 500 失敗にする (中間状態を観測可能にする)
    server.use(
      http.patch(`${API}/admin/users/:userId`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ message: 'fail' }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useUpdateUserMutation(), { wrapper });
    const promise = result.current.mutateAsync({
      userId: 2,
      patch: { enabled: false },
    });
    // Node の unhandled rejection を即時消費 (assertion は別 chain で再評価)
    const captured = promise.catch((err) => err);

    // 中間状態: 楽観更新で enabled=false に変わっているはず
    await waitFor(() => {
      const optimistic = qc.getQueryData<{ id: number; enabled: boolean }[]>(queryKey);
      expect(optimistic?.find((u) => u.id === 2)?.enabled).toBe(false);
    });

    // 失敗を待つ
    const err = await captured;
    expect(err).toMatchObject({ status: 500 });

    // ロールバック: enabled=true に戻る
    const after = qc.getQueryData<{ id: number; enabled: boolean }[]>(queryKey);
    expect(after?.find((u) => u.id === 2)?.enabled).toBe(true);
  });
});
