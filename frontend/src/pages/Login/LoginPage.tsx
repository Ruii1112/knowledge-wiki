import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/Form/LoginForm';
import { authService } from '../../services/auth';
import { LoginFormData } from '../../types/auth';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (formData: LoginFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      await authService.signup(formData);
      // ログイン成功後はホーム画面へ遷移
      navigate('/login', { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'ユーザー登録に失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>ログイン</h1>
          <p className={styles.subtitle}>ナレッジWikiへようこそ</p>
        </div>

        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <p className={styles.footer}>
          ソーシャルログイン等は今後追加予定です
        </p>
      </div>

      <div className={styles.backgroundDecoration} />
    </div>
  );
};
