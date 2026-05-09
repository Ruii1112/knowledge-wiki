import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type Variant = 'error' | 'info' | 'success';

interface AlertProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'error', children, className }: AlertProps) {
  const role = variant === 'error' ? 'alert' : 'status';
  return (
    <p role={role} className={`${styles.alert} ${styles[variant]} ${className ?? ''}`}>
      {children}
    </p>
  );
}
