import { useState } from 'react';
import type { Role, User } from '../../../api/schemas';
import { Alert, StatusMessage } from '../../../components/ui';
import { formatDate } from '../../../lib/format';
import { useAuth } from '../../auth/context/AuthContext';
import { useAdminUsersQuery, useUpdateUserMutation } from '../api/hooks';
import styles from './UserAdminPage.module.css';

const PAGE_SIZE = 20;

export function UserAdminPage() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(0);
  const usersQuery = useAdminUsersQuery({ page, size: PAGE_SIZE });
  const updateMutation = useUpdateUserMutation();

  const isLoading = usersQuery.isLoading;
  const loadError = usersQuery.error;
  const users = usersQuery.data ?? [];
  const isBusy = updateMutation.isPending;

  const updateUser = (target: User, patch: { role?: Role; enabled?: boolean }) => {
    updateMutation.mutate({ userId: target.id, patch });
  };

  const hasNext = users.length === PAGE_SIZE;
  const hasPrev = page > 0;

  if (isLoading) return <StatusMessage busy>読み込み中...</StatusMessage>;
  if (loadError) {
    return (
      <Alert>
        {loadError instanceof Error ? loadError.message : 'ユーザー一覧の取得に失敗しました'}
      </Alert>
    );
  }

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>ユーザー管理</h1>
      </header>

      {updateMutation.isError && (
        <Alert>
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : 'ユーザー更新に失敗しました'}
        </Alert>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>ユーザー名</th>
            <th className={styles.th}>メール</th>
            <th className={styles.th}>登録日</th>
            <th className={styles.th}>ロール</th>
            <th className={styles.th}>有効</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = me?.id === u.id;
            const rowDisabled = isSelf || isBusy;
            return (
              <tr key={u.id} className={styles.row}>
                <td className={styles.td}>{u.id}</td>
                <td className={styles.td}>
                  {u.username}
                  {isSelf && <span className={styles.selfBadge}>(自分)</span>}
                </td>
                <td className={styles.td}>{u.email}</td>
                <td className={styles.td}>{formatDate(u.createdAt)}</td>
                <td className={styles.td}>
                  <select
                    className={styles.roleSelect}
                    value={u.role}
                    disabled={rowDisabled}
                    onChange={(e) => updateUser(u, { role: e.target.value as Role })}
                    aria-label={`${u.username} のロール`}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className={styles.td}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={u.enabled}
                      disabled={rowDisabled}
                      onChange={(e) => updateUser(u, { enabled: e.target.checked })}
                      aria-label={`${u.username} の有効状態`}
                    />
                    <span>{u.enabled ? '有効' : '無効'}</span>
                  </label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {(hasPrev || hasNext) && (
        <nav className={styles.pager} aria-label="ページング">
          <button
            type="button"
            className={styles.pagerBtn}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!hasPrev || isBusy}
          >
            ← 前へ
          </button>
          <span className={styles.pagerLabel}>ページ {page + 1}</span>
          <button
            type="button"
            className={styles.pagerBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || isBusy}
          >
            次へ →
          </button>
        </nav>
      )}

      <p className={styles.note}>※ 自分自身のロール / 有効状態は変更できません。</p>
    </section>
  );
}
