import React, { InputHTMLAttributes } from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        <label htmlFor={props.id} className={styles.label}>
          {label}
        </label>
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
          {...props}
        />
        {error && <span className={styles.error}>{error}</span>}
        {helperText && !error && <span className={styles.helper}>{helperText}</span>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
