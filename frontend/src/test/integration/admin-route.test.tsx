import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { authApi } from '../../features/auth/api/auth';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import { ProtectedRoute } from '../../features/auth/routes/ProtectedRoute';
import { tokenStorage } from '../../lib/apiClient';
import { renderWithProviders } from '../utils';

function AdminPage() {
  return <h1>管理者ページ</h1>;
}
function ArticlesPage() {
  return <h1>記事一覧</h1>;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/articles" element={<ArticlesPage />} />
      </Routes>
    </AuthProvider>
  );
}

describe('ProtectedRoute requireAdmin', () => {
  it('一般ユーザーは /admin/users → /articles へリダイレクト', async () => {
    const { token } = await authApi.login({
      username: 'user1',
      password: 'password',
    });
    tokenStorage.set(token);
    renderWithProviders(<App />, { initialEntries: ['/admin/users'] });
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '記事一覧' })).toBeInTheDocument(),
    );
    expect(screen.queryByText('管理者ページ')).not.toBeInTheDocument();
  });

  it('管理者は /admin/users にアクセス可', async () => {
    const { token } = await authApi.login({
      username: 'admin',
      password: 'password',
    });
    tokenStorage.set(token);
    renderWithProviders(<App />, { initialEntries: ['/admin/users'] });
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '管理者ページ' })).toBeInTheDocument(),
    );
  });
});
