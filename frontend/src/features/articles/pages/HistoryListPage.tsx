import { Link, useParams } from 'react-router-dom';
import { Alert, StatusMessage } from '../../../components/ui';
import { ApiError } from '../../../lib/apiClient';
import { formatDateTime } from '../../../lib/format';
import { parsePositiveId } from '../../../lib/id';
import { useHistoriesQuery } from '../api/hooks';
import styles from './HistoryListPage.module.css';

export function HistoryListPage() {
  const { id } = useParams<{ id: string }>();
  const articleId = parsePositiveId(id);
  const historiesQuery = useHistoriesQuery(articleId);

  if (articleId === null) {
    return (
      <div>
        <Alert>無効な記事IDです</Alert>
        <Link to="/articles" className={styles.backLink}>
          記事一覧へ
        </Link>
      </div>
    );
  }

  const isLoading = historiesQuery.isLoading;
  const histories = historiesQuery.data ?? [];
  const errorMessage = historiesQuery.error
    ? historiesQuery.error instanceof ApiError && historiesQuery.error.status === 404
      ? '記事が見つかりません'
      : historiesQuery.error instanceof Error
        ? historiesQuery.error.message
        : '履歴の取得に失敗しました'
    : undefined;

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>編集履歴</h1>
        <Link to={`/articles/${articleId}`} className={styles.backLink}>
          記事へ戻る
        </Link>
      </header>

      {isLoading && <StatusMessage busy>読み込み中...</StatusMessage>}
      {errorMessage && <Alert>{errorMessage}</Alert>}
      {!isLoading && !errorMessage && histories.length === 0 && (
        <StatusMessage>編集履歴はまだありません</StatusMessage>
      )}

      {!isLoading && !errorMessage && histories.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>バージョン</th>
              <th className={styles.th}>編集者</th>
              <th className={styles.th}>編集日時</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {histories.map((h) => (
              <tr key={h.id} className={styles.row}>
                <td className={styles.td}>v{h.version}</td>
                <td className={styles.td}>{h.editedBy}</td>
                <td className={styles.td}>{formatDateTime(h.editedAt)}</td>
                <td className={styles.tdAction}>
                  <Link
                    to={`/articles/${articleId}/histories/${h.id}`}
                    className={styles.detailLink}
                  >
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
