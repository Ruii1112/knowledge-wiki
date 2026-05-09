import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { LoginRequestSchema, type LoginRequest } from '../../../api/schemas';
import { Button, PasswordInput, TextInput, Alert } from '../../../components/ui';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => Promise<void>;
  error?: string;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { username: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {error && <Alert>{error}</Alert>}

      <TextInput
        id="username"
        label="ユーザー名"
        placeholder="user"
        autoComplete="username"
        disabled={isSubmitting}
        error={errors.username?.message}
        {...register('username')}
      />
      <PasswordInput
        id="password"
        label="パスワード"
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
        {isSubmitting ? 'ログイン中...' : 'ログイン'}
      </Button>

      <p className={styles.registerLink}>
        アカウントをお持ちでないですか？ <Link to="/register">アカウント作成</Link>
      </p>
    </form>
  );
}
