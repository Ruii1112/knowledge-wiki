import type { InputHTMLAttributes } from 'react';
import React, { useState } from 'react';
import styles from './PasswordInput.module.css';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={styles.wrapper}>
        <label htmlFor={props.id} className={styles.label}>
          {label}
        </label>
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
            {...props}
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '隠す' : '表示'}
          </button>
        </div>
        {error && <span className={styles.error}>{error}</span>}
        {helperText && !error && <span className={styles.helper}>{helperText}</span>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
