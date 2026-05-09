import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { tokenStorage } from '../../../lib/apiClient';
import { createTestQueryClient } from '../../../test/utils';
import { authApi } from '../../auth/api/auth';
import { useArticleQuery, useArticlesQuery, useHistoriesQuery } from './hooks';

function makeWrapper() {
  const qc = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

// 詳細/履歴/コメントAPIは OpenAPI上 auth 必須なので各テスト前にlogin
beforeEach(async () => {
  const { token } = await authApi.login({
    username: 'admin',
    password: 'password',
  });
  tokenStorage.set(token);
});

describe('useArticlesQuery', () => {
  it('全記事を取得', async () => {
    const { result } = renderHook(() => useArticlesQuery({}), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('keyword で絞り込み', async () => {
    const { result } = renderHook(() => useArticlesQuery({ keyword: 'Spring' }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.every((a) => a.title.toLowerCase().includes('spring'))).toBe(true);
  });
});

describe('useArticleQuery', () => {
  it('id=null の場合は実行されない', () => {
    const { result } = renderHook(() => useArticleQuery(null), {
      wrapper: makeWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('既存記事の取得', async () => {
    const { result } = renderHook(() => useArticleQuery(1), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(1);
  });

  it('存在しない id で 404', async () => {
    const { result } = renderHook(() => useArticleQuery(99999), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useHistoriesQuery', () => {
  it('article 1 の履歴を取得', async () => {
    const { result } = renderHook(() => useHistoriesQuery(1), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
