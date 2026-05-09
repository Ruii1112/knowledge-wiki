import type { Comment } from '../../../api/schemas';
import { formatDateTime } from '../../../lib/format';
import styles from './CommentList.module.css';

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className={styles.empty}>まだコメントはありません</p>;
  }
  return (
    <ul className={styles.list}>
      {comments.map((c) => (
        <li key={c.id} className={styles.item}>
          <div className={styles.head}>
            <span className={styles.author}>{c.author}</span>
            <span className={styles.date}>{formatDateTime(c.createdAt)}</span>
          </div>
          <p className={styles.body}>{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
