import type {
  ArticleDetail,
  ArticleSummary,
  Comment,
  HistoryDetail,
  HistorySummary,
  User,
} from '../../api/schemas';

const now = () => new Date().toISOString();

interface MockDb {
  users: Array<User & { password: string }>;
  articles: ArticleDetail[];
  histories: HistoryDetail[];
  comments: Comment[];
  nextUserId: number;
  nextArticleId: number;
  nextHistoryId: number;
  nextCommentId: number;
}

// 初期 fixture を生成する関数。テストの resetDb() で deep clone して使う。
const buildInitialDb = (): MockDb => ({
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      role: 'ADMIN',
      enabled: true,
      createdAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      password: 'password',
      role: 'USER',
      enabled: true,
      createdAt: '2026-02-01T09:00:00Z',
    },
    {
      id: 3,
      username: 'user2',
      email: 'user2@example.com',
      password: 'password',
      role: 'USER',
      enabled: false,
      createdAt: '2026-02-15T09:00:00Z',
    },
  ],
  articles: [
    {
      id: 1,
      title: 'Spring Boot入門',
      content:
        '# Spring Boot入門\n\nSpring Bootを使ったWebアプリケーション開発の基本を解説します。\n\n## セットアップ\n\n`build.gradle`に依存関係を追加します。',
      author: 'user1',
      tags: ['spring', 'backend'],
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-03-02T12:30:00Z',
    },
    {
      id: 2,
      title: 'React 19の新機能まとめ',
      content:
        '# React 19の新機能\n\n- Server Components\n- Actions\n- use() フック\n\n詳細は公式ドキュメントを参照してください。',
      author: 'user2',
      tags: ['react', 'frontend'],
      createdAt: '2026-03-05T10:00:00Z',
      updatedAt: '2026-03-05T10:00:00Z',
    },
    {
      id: 3,
      title: 'JWT認証の実装パターン',
      content:
        '# JWT認証\n\nSpring Security 7でのJWT実装方針について。\n\n```java\n@EnableWebSecurity\npublic class SecurityConfig { }\n```',
      author: 'admin',
      tags: ['spring', 'security'],
      createdAt: '2026-03-10T14:00:00Z',
      updatedAt: '2026-03-12T09:00:00Z',
    },
  ],
  histories: [
    {
      id: 1,
      articleId: 1,
      title: 'Spring Boot入門 (初稿)',
      content: '# Spring Boot入門\n\n初稿です。',
      version: 1,
      editedBy: 'user1',
      editedAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 2,
      articleId: 3,
      title: 'JWT認証',
      content: '# JWT認証\n\n初稿です。',
      version: 1,
      editedBy: 'admin',
      editedAt: '2026-03-10T14:00:00Z',
    },
  ],
  comments: [
    {
      id: 1,
      articleId: 1,
      userId: 2,
      author: 'user1',
      content: '参考になりました！',
      createdAt: '2026-03-03T10:00:00Z',
    },
    {
      id: 2,
      articleId: 1,
      userId: 1,
      author: 'admin',
      content: 'セットアップ手順がわかりやすいです。',
      createdAt: '2026-03-03T11:00:00Z',
    },
  ],
  nextUserId: 4,
  nextArticleId: 4,
  nextHistoryId: 3,
  nextCommentId: 3,
});

export const db: MockDb = buildInitialDb();

// テスト用: 既存 db を初期 fixture に上書き。リファレンスは保つ。
export const resetDb = (): void => {
  const fresh = buildInitialDb();
  db.users = fresh.users;
  db.articles = fresh.articles;
  db.histories = fresh.histories;
  db.comments = fresh.comments;
  db.nextUserId = fresh.nextUserId;
  db.nextArticleId = fresh.nextArticleId;
  db.nextHistoryId = fresh.nextHistoryId;
  db.nextCommentId = fresh.nextCommentId;
};

export const toArticleSummary = (a: ArticleDetail): ArticleSummary => ({
  id: a.id,
  title: a.title,
  author: a.author,
  tags: a.tags,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

export const toHistorySummary = (h: HistoryDetail): HistorySummary => ({
  id: h.id,
  version: h.version,
  editedBy: h.editedBy,
  editedAt: h.editedAt,
});

export const currentTimestamp = now;
