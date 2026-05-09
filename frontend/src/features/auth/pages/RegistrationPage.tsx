import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../api/hooks';
import { RegistrationForm } from '../components/RegistrationForm';
import type { SignupFormValues } from '../schemas';
import styles from './RegistrationPage.module.css';

export function RegistrationPage() {
  const navigate = useNavigate();
  const signup = useSignupMutation();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (data: SignupFormValues) => {
    setError(undefined);
    try {
      await signup.mutateAsync(data);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザー登録に失敗しました');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>アカウント作成</h1>
          <p className={styles.subtitle}>ナレッジWikiに登録して始めましょう</p>
        </div>

        <RegistrationForm onSubmit={handleSubmit} error={error} />

        <div className={styles.divider}>
          <span>or</span>
        </div>
        <p className={styles.footer}>ソーシャルログイン等は今後追加予定です</p>
      </div>

      <div className={styles.backgroundDecoration} />
    </div>
  );
}
