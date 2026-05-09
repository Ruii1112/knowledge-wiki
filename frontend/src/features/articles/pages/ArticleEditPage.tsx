import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, StatusMessage } from '../../../components/ui';
import { ApiError } from '../../../lib/apiClient';
import { parsePositiveId } from '../../../lib/id';
import { useAuth } from '../../auth/context/AuthContext';
import { useArticleQuery, useUpdateArticleMutation } from '../api/hooks';
import { ArticleForm, type ArticleFormValues } from '../components/ArticleForm';
import styles from './ArticleEditorPage.module.css';

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const articleId = parsePositiveId(id);

  const articleQuery = useArticleQuery(articleId);
  const updateMutation = useUpdateArticleMutation(articleId ?? 0);
  const [error, setError] = useState<string | undefined>();

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
  if (articleQuery.isLoading) return <StatusMessage busy>読み込み中...</StatusMessage>;
  if (articleQuery.error) {
    const err = articleQuery.error;
    const msg =
      err instanceof ApiError && err.status === 404
        ? '記事が見つかりません'
        : err instanceof Error
          ? err.message
          : '記事の取得に失敗しました';
    return (
      <div>
        <Alert>{msg}</Alert>
        <Link to="/articles" className={styles.backLink}>
          記事一覧へ
        </Link>
      </div>
    );
  }
  const article = articleQuery.data;
  if (!article) return null;

  const canEdit = !!user && (article.author === user.username || isAdmin);
  if (!canEdit) {
    return (
      <div>
        <Alert>この記事を編集する権限がありません</Alert>
        <Link to={`/articles/${articleId}`} className={styles.backLink}>
          記事へ戻る
        </Link>
      </div>
    );
  }

  const handleSubmit = async (values: ArticleFormValues) => {
    if (article.id !== articleId) {
      setError('記事の状態が更新されました。再読み込みしてください');
      return;
    }
    setError(undefined);
    try {
      await updateMutation.mutateAsync(values);
      navigate(`/articles/${articleId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の更新に失敗しました');
    }
  };

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>記事を編集</h1>
      <ArticleForm
        key={article.id}
        initialValues={{
          title: article.title,
          content: article.content,
          tags: article.tags,
        }}
        submitLabel="更新"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/articles/${articleId}`)}
        error={error}
      />
    </section>
  );
}
