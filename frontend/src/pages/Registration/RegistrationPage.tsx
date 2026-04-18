import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationForm } from '../../components/Form/RegistrationForm';
import { authService } from '../../services/auth';
import { RegistrationFormData } from '../../types/auth';
import styles from './RegistrationPage.module.css';

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (formData: RegistrationFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      await authService.signup(formData);
      // Navigate to login page on success
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
          <h1 className={styles.title}>アカウント作成</h1>
          <p className={styles.subtitle}>ナレッジWikiに登録して始めましょう</p>
        </div>

        <RegistrationForm
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
