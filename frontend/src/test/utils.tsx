import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement, type ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';

interface TestProvidersProps {
  children: ReactNode;
  initialEntries?: MemoryRouterProps['initialEntries'];
  queryClient?: QueryClient;
}

// テスト用 QueryClient: retry 無効化、cache 即時破棄でテストの予測性を上げる
// MutationCache の onError で unhandled rejection を抑止
// (mutation の onError は各テストで個別 handle されているのでログのみ消す)
export function createTestQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: () => {
        // suppress unhandled rejection during tests
      },
    }),
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function TestProviders({
  children,
  initialEntries = ['/'],
  queryClient,
}: TestProvidersProps) {
  // useState で QueryClient を mount 時に固定化 (rerender で cache 消失を防ぐ)
  const [qc] = useState(() => queryClient ?? createTestQueryClient());
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

interface RenderWithProvidersOptions extends RenderOptions {
  initialEntries?: MemoryRouterProps['initialEntries'];
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialEntries, queryClient, ...options }: RenderWithProvidersOptions = {},
) {
  const user = userEvent.setup();
  const result = render(ui, {
    wrapper: ({ children }) => (
      <TestProviders initialEntries={initialEntries} queryClient={queryClient}>
        {children}
      </TestProviders>
    ),
    ...options,
  });
  return { user, ...result };
}

// AuthProvider も含むラッパー (useAuth を使うコンポーネントのテスト用)
export function renderWithAuth(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
  return renderWithProviders(<AuthProvider>{ui}</AuthProvider>, options);
}
