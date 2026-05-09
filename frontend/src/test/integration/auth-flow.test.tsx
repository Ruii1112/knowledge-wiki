import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../features/auth/context/AuthContext';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { ProtectedRoute } from '../../features/auth/routes/ProtectedRoute';
import { renderWithProviders } from '../utils';

function Protected() {
  return <p>機密ページ</p>;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <Protected />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

describe('Auth flow', () => {
  it('未認証で保護ルートにアクセス → /login へ誘導', async () => {
    renderWithProviders(<App />, { initialEntries: ['/secret'] });
    expect(await screen.findByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('正常ログイン後に from で復帰', async () => {
    const { user } = renderWithProviders(<App />, {
      initialEntries: ['/secret'],
    });
    await user.type(await screen.findByLabelText('ユーザー名'), 'admin');
    await user.type(screen.getByLabelText('パスワード'), 'password');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    await waitFor(() => expect(screen.getByText('機密ページ')).toBeInTheDocument());
  });

  it('誤資格情報で 401 メッセージを表示', async () => {
    const { user } = renderWithProviders(<App />, { initialEntries: ['/login'] });
    await user.type(await screen.findByLabelText('ユーザー名'), 'admin');
    await user.type(screen.getByLabelText('パスワード'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(await screen.findByText('ユーザー名またはパスワードが違います')).toBeInTheDocument();
  });
});
