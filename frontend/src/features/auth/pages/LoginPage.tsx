import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../../../api/schemas';
import { StatusMessage } from '../../../components/ui';
import { ApiError } from '../../../lib/apiClient';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const isInternalPath = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');

const resolveRedirectTarget = (state: unknown): string => {
  const from = (state as { from?: unknown } | null)?.from;
  return isInternalPath(from) ? from : '/articles';
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isInitializing } = useAuth();
  const [error, setError] = useState<string | undefined>();

  if (isInitializing) {
    return <StatusMessage busy>読み込み中...</StatusMessage>;
  }
  if (isAuthenticated) {
    return <Navigate to={resolveRedirectTarget(location.state)} replace />;
  }

  const handleSubmit = async (data: LoginRequest) => {
    setError(undefined);
    try {
      await login(data);
      navigate(resolveRedirectTarget(location.state), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('ユーザー名またはパスワードが違います');
      } else {
        setError(err instanceof Error ? err.message : 'ログインに失敗しました');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>ログイン</h1>
          <p className={styles.subtitle}>ナレッジWikiにサインインしてください</p>
        </div>
        <LoginForm onSubmit={handleSubmit} error={error} />
      </div>
      <div className={styles.backgroundDecoration} />
    </div>
  );
}
