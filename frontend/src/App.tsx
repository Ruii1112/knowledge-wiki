import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/Layout';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ProtectedRoute } from './features/auth/routes/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import './styles/globals.css';

// 各ページは route 単位の code splitting で初期バンドルを軽くする
// (NotFoundPage は十分小さいので eager のまま)
const LoginPage = lazy(() =>
  import('./features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegistrationPage = lazy(() =>
  import('./features/auth/pages/RegistrationPage').then((m) => ({
    default: m.RegistrationPage,
  })),
);
const ArticleListPage = lazy(() =>
  import('./features/articles/pages/ArticleListPage').then((m) => ({
    default: m.ArticleListPage,
  })),
);
const ArticleDetailPage = lazy(() =>
  import('./features/articles/pages/ArticleDetailPage').then((m) => ({
    default: m.ArticleDetailPage,
  })),
);
const ArticleCreatePage = lazy(() =>
  import('./features/articles/pages/ArticleCreatePage').then((m) => ({
    default: m.ArticleCreatePage,
  })),
);
const ArticleEditPage = lazy(() =>
  import('./features/articles/pages/ArticleEditPage').then((m) => ({
    default: m.ArticleEditPage,
  })),
);
const HistoryListPage = lazy(() =>
  import('./features/articles/pages/HistoryListPage').then((m) => ({
    default: m.HistoryListPage,
  })),
);
const HistoryDetailPage = lazy(() =>
  import('./features/articles/pages/HistoryDetailPage').then((m) => ({
    default: m.HistoryDetailPage,
  })),
);
const UserAdminPage = lazy(() =>
  import('./features/admin/pages/UserAdminPage').then((m) => ({
    default: m.UserAdminPage,
  })),
);

export default function App(): React.ReactNode {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* AppLayout 内に Suspense があり、Header はフラッシュしない */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/articles" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />

              <Route path="/articles" element={<ArticleListPage />} />
              <Route
                path="/articles/new"
                element={
                  <ProtectedRoute>
                    <ArticleCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/articles/:id"
                element={
                  <ProtectedRoute>
                    <ArticleDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/articles/:id/edit"
                element={
                  <ProtectedRoute>
                    <ArticleEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/articles/:id/histories"
                element={
                  <ProtectedRoute>
                    <HistoryListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/articles/:id/histories/:historyId"
                element={
                  <ProtectedRoute>
                    <HistoryDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UserAdminPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
