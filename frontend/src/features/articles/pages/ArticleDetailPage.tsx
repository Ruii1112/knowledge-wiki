import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, LinkButton, MarkdownViewer, StatusMessage } from '../../../components/ui';
import { ApiError } from '../../../lib/apiClient';
import { formatDate } from '../../../lib/format';
import { parsePositiveId } from '../../../lib/id';
import { useAuth } from '../../auth/context/AuthContext';
import { CommentForm } from '../../comments/components/CommentForm';
import { CommentList } from '../../comments/components/CommentList';
import {
  useArticleQuery,
  useCommentsQuery,
  useDeleteArticleMutation,
  usePostCommentMutation,
} from '../api/hooks';
import styles from './ArticleDetailPage.module.css';

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const articleId = parsePositiveId(id);

  const articleQuery = useArticleQuery(articleId);
  const commentsQuery = useCommentsQuery(articleId);
  const deleteMutation = useDeleteArticleMutation();
  const postCommentMutation = usePostCommentMutation(articleId ?? 0);

  const [opError, setOpError] = useState<string | undefined>();

  if (articleId === null) {
    return (
      <div>
        <Alert>無効な記事IDです</Alert>
        <LinkButton to="/articles" className={styles.backLinkSpacing}>
          記事一覧へ
        </LinkButton>
      </div>
    );
  }

  if (articleQuery.isLoading) return <StatusMessage busy>読み込み中...</StatusMessage>;
  if (articleQuery.error) {
    const err = articleQuery.error;
    const msg =
      err instanceof ApiError && err.status === 404
        ? '記事が見つかりません'
        : err instanceof Error
          ? err.message
          : '記事の取得に失敗しました';
    return <Alert>{msg}</Alert>;
  }
  const article = articleQuery.data;
  if (!article) return null;

  const canEdit = !!user && (article.author === user.username || isAdmin);
  const comments = commentsQuery.data ?? [];

  const handleCommentSubmit = async (content: string) => {
    await postCommentMutation.mutateAsync({ content });
  };

  const handleDelete = async () => {
    if (!window.confirm('この記事を削除しますか？')) return;
    setOpError(undefined);
    try {
      await deleteMutation.mutateAsync(articleId);
      navigate('/articles', { replace: true });
    } catch (err) {
      setOpError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  return (
    <article>
      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        <div className={styles.meta}>
          <span>by {article.author}</span>
          <span>作成: {formatDate(article.createdAt)}</span>
          <span>更新: {formatDate(article.updatedAt)}</span>
        </div>
        {article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.map((t) => (
              <span key={t} className={styles.tag}>
                #{t}
              </span>
            ))}
          </div>
        )}
        <div className={styles.actions}>
          <LinkButton to={`/articles/${articleId}/histories`}>履歴を見る</LinkButton>
          {canEdit && (
            <>
              <LinkButton to={`/articles/${articleId}/edit`}>編集</LinkButton>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '削除中...' : '削除'}
              </button>
            </>
          )}
        </div>
        {opError && <Alert>{opError}</Alert>}
      </header>

      <section className={styles.content}>
        <MarkdownViewer source={article.content} />
      </section>

      <section className={styles.commentSection}>
        <h2 className={styles.sectionTitle}>コメント</h2>
        <CommentForm onSubmit={handleCommentSubmit} />
        {commentsQuery.error ? (
          <Alert>
            {commentsQuery.error instanceof Error
              ? commentsQuery.error.message
              : 'コメントの取得に失敗しました'}
          </Alert>
        ) : (
          <CommentList comments={comments} />
        )}
      </section>
    </article>
  );
}
