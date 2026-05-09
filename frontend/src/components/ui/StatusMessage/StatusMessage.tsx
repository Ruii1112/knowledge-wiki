import type { ReactNode } from 'react';
import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  children: ReactNode;
  busy?: boolean;
}

export function StatusMessage({ children, busy = false }: StatusMessageProps) {
  return (
    <p className={styles.status} aria-busy={busy} role="status">
      {children}
    </p>
  );
}
