import { Component, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className={styles.container} role="alert">
          <h2 className={styles.title}>予期せぬエラーが発生しました</h2>
          <p className={styles.message}>{this.state.error.message}</p>
          <button type="button" className={styles.button} onClick={this.reset}>
            再試行
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
