import { Link, useParams } from 'react-router-dom';
import { Alert, LinkButton, MarkdownViewer, StatusMessage } from '../../../components/ui';
import { ApiError } from '../../../lib/apiClient';
import { formatDateTime } from '../../../lib/format';
import { parsePositiveId } from '../../../lib/id';
import { useHistoryQuery } from '../api/hooks';
import styles from './HistoryDetailPage.module.css';

export function HistoryDetailPage() {
  const { id, historyId } = useParams<{ id: string; historyId: string }>();
  const articleId = parsePositiveId(id);
  const histId = parsePositiveId(historyId);
  const historyQuery = useHistoryQuery(articleId, histId);

  if (articleId === null || histId === null) {
    return (
      <div>
        <Alert>無効なIDです</Alert>
        <Link to="/articles" className={styles.backLink}>
          記事一覧へ
        </Link>
      </div>
    );
  }
  if (historyQuery.isLoading) return <StatusMessage busy>読み込み中...</StatusMessage>;
  if (historyQuery.error) {
    const err = historyQuery.error;
    const msg =
      err instanceof ApiError && err.status === 404
        ? '履歴が見つかりません'
        : err instanceof Error
          ? err.message
          : '履歴の取得に失敗しました';
    return (
      <div>
        <Alert>{msg}</Alert>
        <Link to={`/articles/${articleId}/histories`} className={styles.backLink}>
          履歴一覧へ
        </Link>
      </div>
    );
  }
  const history = historyQuery.data;
  if (!history) return null;

  return (
    <article>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{history.title}</h1>
          <span className={styles.versionBadge}>v{history.version}</span>
        </div>
        <div className={styles.meta}>
          <span>編集者: {history.editedBy}</span>
          <span>編集日時: {formatDateTime(history.editedAt)}</span>
        </div>
        <div className={styles.actions}>
          <LinkButton to={`/articles/${articleId}/histories`}>履歴一覧へ</LinkButton>
          <LinkButton to={`/articles/${articleId}`}>記事へ戻る</LinkButton>
        </div>
      </header>

      <section className={styles.content}>
        <MarkdownViewer source={history.content} />
      </section>
    </article>
  );
}
