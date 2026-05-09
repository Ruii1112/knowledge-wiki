import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateArticleMutation } from '../api/hooks';
import { ArticleForm, type ArticleFormValues } from '../components/ArticleForm';
import styles from './ArticleEditorPage.module.css';

export function ArticleCreatePage() {
  const navigate = useNavigate();
  const create = useCreateArticleMutation();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (values: ArticleFormValues) => {
    setError(undefined);
    try {
      const created = await create.mutateAsync(values);
      navigate(`/articles/${created.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の作成に失敗しました');
    }
  };

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>記事を作成</h1>
      <ArticleForm
        submitLabel="作成"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/articles')}
        error={error}
      />
    </section>
  );
}
