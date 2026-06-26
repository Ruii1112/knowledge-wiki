import React, { useRef, useState } from 'react';
import { TextInput } from '../Input/TextInput';
import { PasswordInput } from '../Input/PasswordInput';
import { Button } from '../Button/Button';
import { LoginFormData } from '../../types/auth';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上である必要があります';
    } else if (formData.username.length > 50) {
      newErrors.username = 'ユーザー名は50文字以下である必要があります';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上である必要があります';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'パスワードは大文字を含む必要があります';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'パスワードは小文字を含む必要があります';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'パスワードは数字を含む必要があります';
    }

  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form} noValidate>
      {error && <div className={styles.globalError}>{error}</div>}

      <TextInput
        id="username"
        name="username"
        label="ユーザー名"
        placeholder="johndoe"
        value={formData.username}
        onChange={handleInputChange}
        error={errors.username}
        disabled={isLoading}
        autoComplete="username"
        required
      />

      <PasswordInput
        id="password"
        name="password"
        label="パスワード"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        disabled={isLoading}
        helperText="8文字以上、大文字・小文字・数字を含む"
        autoComplete="new-password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </Button>

      <p className={styles.loginLink}>
        既にアカウントをお持ちですか？{' '}
        <a href="/login">ログイン</a>
      </p>
    </form>
  );
};
