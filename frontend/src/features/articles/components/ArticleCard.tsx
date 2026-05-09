import { Link } from 'react-router-dom';
import type { ArticleSummary } from '../../../api/schemas';
import { formatDate } from '../../../lib/format';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  article: ArticleSummary;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link to={`/articles/${article.id}`} className={styles.card}>
      <h3 className={styles.title}>{article.title}</h3>
      <div className={styles.meta}>
        <span>by {article.author}</span>
        <span>{formatDate(article.updatedAt)}</span>
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
    </Link>
  );
}
