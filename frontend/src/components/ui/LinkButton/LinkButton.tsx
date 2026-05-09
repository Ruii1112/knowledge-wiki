import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import styles from './LinkButton.module.css';

type Variant = 'default' | 'primary';

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant;
}

export function LinkButton({ variant = 'default', className, ...rest }: LinkButtonProps) {
  return <Link {...rest} className={`${styles.btn} ${styles[variant]} ${className ?? ''}`} />;
}
