import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Alert, Button, PasswordInput, TextInput } from '../../../components/ui';
import { SignupFormSchema, type SignupFormValues } from '../schemas';
import styles from './RegistrationForm.module.css';

interface RegistrationFormProps {
  onSubmit: (data: SignupFormValues) => Promise<void>;
  error?: string;
}

export function RegistrationForm({ onSubmit, error }: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {error && <Alert>{error}</Alert>}

      <TextInput
        id="username"
        label="ユーザー名"
        placeholder="johndoe"
        autoComplete="username"
        disabled={isSubmitting}
        error={errors.username?.message}
        {...register('username')}
      />
      <TextInput
        id="email"
        type="email"
        label="メールアドレス"
        placeholder="user@example.com"
        autoComplete="email"
        disabled={isSubmitting}
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordInput
        id="password"
        label="パスワード"
        placeholder="••••••••"
        autoComplete="new-password"
        disabled={isSubmitting}
        helperText="8文字以上、大文字・小文字・数字を含む"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordInput
        id="confirmPassword"
        label="パスワード（確認）"
        placeholder="••••••••"
        autoComplete="new-password"
        disabled={isSubmitting}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
        {isSubmitting ? 'アカウント作成中...' : 'アカウント作成'}
      </Button>

      <p className={styles.loginLink}>
        既にアカウントをお持ちですか？ <Link to="/login">ログイン</Link>
      </p>
    </form>
  );
}
