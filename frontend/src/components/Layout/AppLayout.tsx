import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { StatusMessage } from '../ui';
import styles from './AppLayout.module.css';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {/* lazy route の chunk 取得中は Header を維持して Outlet 部分だけ fallback */}
        <Suspense fallback={<StatusMessage busy>読み込み中...</StatusMessage>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
