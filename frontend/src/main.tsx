import { QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import App from './App';
import { queryClient } from './lib/queryClient';

// production deploy 後に古い HTML が削除済み chunk を要求した時の復旧。
// 同じセッションでループしないよう sessionStorage で1回だけ reload する。
const PRELOAD_RELOADED_KEY = 'app.preloadReloaded';
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem(PRELOAD_RELOADED_KEY)) return;
  sessionStorage.setItem(PRELOAD_RELOADED_KEY, '1');
  window.location.reload();
});
window.addEventListener('load', () => {
  // 通常起動が成功した時点でフラグをクリア
  sessionStorage.removeItem(PRELOAD_RELOADED_KEY);
});

async function enableMocking() {
  if (!import.meta.env.DEV) return;
  if (import.meta.env.VITE_DISABLE_MSW === 'true') return;
  const { worker } = await import('./lib/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
});
