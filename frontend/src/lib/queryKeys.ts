// クエリキーを集約 (TanStack Query の invalidate 対象を一元管理)
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  articles: {
    all: ['articles'] as const,
    list: (params: { keyword?: string; tag?: string; page?: number }) =>
      ['articles', 'list', params] as const,
    detail: (id: number) => ['articles', 'detail', id] as const,
    histories: (articleId: number) => ['articles', articleId, 'histories'] as const,
    history: (articleId: number, historyId: number) =>
      ['articles', articleId, 'histories', historyId] as const,
    comments: (articleId: number) => ['articles', articleId, 'comments'] as const,
  },
  admin: {
    all: ['admin'] as const,
    usersAll: ['admin', 'users'] as const,
    users: (params: { page?: number; size?: number }) => ['admin', 'users', params] as const,
  },
};
