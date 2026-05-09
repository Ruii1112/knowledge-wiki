import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, LinkButton, StatusMessage } from '../../../components/ui';
import { useAuth } from '../../auth/context/AuthContext';
import { useArticlesQuery } from '../api/hooks';
import { ArticleCard } from '../components/ArticleCard';
import styles from './ArticleListPage.module.css';

const PAGE_SIZE = 20;

const parsePage = (raw: string | null): number => {
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 0;
};

export function ArticleListPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedKeyword = searchParams.get('keyword') ?? '';
  const appliedTag = searchParams.get('tag') ?? '';
  const page = parsePage(searchParams.get('page'));

  const [keyword, setKeyword] = useState(appliedKeyword);
  const [tag, setTag] = useState(appliedTag);

  useEffect(() => {
    setKeyword(appliedKeyword);
    setTag(appliedTag);
  }, [appliedKeyword, appliedTag]);

  const articlesQuery = useArticlesQuery({
    keyword: appliedKeyword || undefined,
    tag: appliedTag || undefined,
    page,
    size: PAGE_SIZE,
  });

  const articles = articlesQuery.data ?? [];
  const isLoading = articlesQuery.isLoading;
  const error = articlesQuery.error;

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next, { replace: false });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParams({
      keyword: keyword.trim() || undefined,
      tag: tag.trim() || undefined,
      page: undefined,
    });
  };

  const handleClear = () => {
    setKeyword('');
    setTag('');
    setSearchParams(new URLSearchParams(), { replace: false });
  };

  const goPrev = () => updateParams({ page: page > 1 ? String(page - 1) : undefined });
  const goNext = () => updateParams({ page: String(page + 1) });

  const hasNext = articles.length === PAGE_SIZE;
  const hasPrev = page > 0;

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>記事一覧</h1>
        {isAuthenticated && (
          <LinkButton to="/articles/new" variant="primary">
            新規作成
          </LinkButton>
        )}
      </header>

      <form className={styles.searchBar} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.input}
          placeholder="タイトル検索..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          type="text"
          className={styles.input}
          placeholder="タグ (例: spring)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <Button type="submit" variant="primary" size="md">
          検索
        </Button>
        {(appliedKeyword || appliedTag) && (
          <button type="button" onClick={handleClear} className={styles.clearBtn}>
            クリア
          </button>
        )}
      </form>

      {isLoading && <StatusMessage busy>読み込み中...</StatusMessage>}
      {error && (
        <Alert>{error instanceof Error ? error.message : '記事一覧の取得に失敗しました'}</Alert>
      )}
      {!isLoading && !error && articles.length === 0 && (
        <StatusMessage>該当する記事がありません</StatusMessage>
      )}

      <div className={styles.list}>
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>

      {!isLoading && !error && (hasPrev || hasNext) && (
        <nav className={styles.pager} aria-label="ページング">
          <button type="button" className={styles.pagerBtn} onClick={goPrev} disabled={!hasPrev}>
            ← 前へ
          </button>
          <span className={styles.pagerLabel}>ページ {page + 1}</span>
          <button type="button" className={styles.pagerBtn} onClick={goNext} disabled={!hasNext}>
            次へ →
          </button>
        </nav>
      )}
    </section>
  );
}
