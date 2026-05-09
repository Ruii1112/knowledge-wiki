import { http, HttpResponse } from 'msw';
import type { ZodSchema } from 'zod';
import {
  ArticleCreateRequestSchema,
  ArticleUpdateRequestSchema,
  CommentCreateRequestSchema,
  LoginRequestSchema,
  SignupRequestSchema,
  UserUpdateRequestSchema,
} from '../../api/schemas';
import { currentTimestamp, db, toArticleSummary, toHistorySummary } from './db';

const API = 'http://localhost:8080/api';

// schema-based body validation. Zod 失敗時に 400 を返す
type AnyHttpResponse = ReturnType<typeof HttpResponse.json>;

async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: AnyHttpResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: HttpResponse.json(errorBody('JSON が不正です', 400), { status: 400 }),
    };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'リクエスト形式が不正です';
    return {
      ok: false,
      response: HttpResponse.json(errorBody(message, 400), { status: 400 }),
    };
  }
  return { ok: true, data: parsed.data };
}

const stripPassword = <T extends { password?: string }>(u: T) => {
  const { password, ...rest } = u;
  void password;
  return rest;
};

const decodeToken = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    return typeof payload.userId === 'number' ? payload.userId : null;
  } catch {
    return null;
  }
};

const userFromAuthHeader = (request: Request) => {
  const auth = request.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const userId = decodeToken(token);
  if (!userId) return null;
  const user = db.users.find((u) => u.id === userId);
  // 無効化済みユーザーの token は失効扱い (401 → クライアント側で自動 logout)
  if (!user || !user.enabled) return null;
  return user;
};

const issueToken = (userId: number) => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ userId, iat: Date.now() }));
  return `${header}.${payload}.mock`;
};

const errorBody = (message: string, status: number) => ({
  message,
  status,
  timestamp: currentTimestamp(),
});

const unauthorized = () => new HttpResponse(null, { status: 401 });
const forbidden = () => new HttpResponse(null, { status: 403 });
const notFound = () => new HttpResponse(null, { status: 404 });
const badRequest = (message: string) => HttpResponse.json(errorBody(message, 400), { status: 400 });

const paginate = <T>(items: T[], url: URL, defaultSize = 20): T[] => {
  const page = Math.max(0, Number(url.searchParams.get('page') ?? 0));
  const size = Math.max(1, Number(url.searchParams.get('size') ?? defaultSize));
  return items.slice(page * size, page * size + size);
};

// Zod schema が型・長さ・必須を見るので、重複のみ検証 (DB tags.name UNIQUE)
const validateTagsUnique = (tags: string[] | undefined): string | null => {
  if (!tags) return null;
  const seen = new Set<string>();
  for (const t of tags) {
    if (seen.has(t)) return 'tags に重複があります';
    seen.add(t);
  }
  return null;
};

export const handlers = [
  // 認証
  http.post(`${API}/auth/signup`, async ({ request }) => {
    const result = await parseBody(request, SignupRequestSchema);
    if (!result.ok) return result.response;
    const body = result.data;
    if (db.users.some((u) => u.username === body.username || u.email === body.email)) {
      return badRequest('ユーザー名またはメールアドレスが既に使用されています');
    }
    const user = {
      id: db.nextUserId++,
      username: body.username,
      email: body.email,
      password: body.password,
      role: 'USER' as const,
      enabled: true,
      createdAt: currentTimestamp(),
    };
    db.users.push(user);
    return HttpResponse.json(stripPassword(user), { status: 201 });
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const result = await parseBody(request, LoginRequestSchema);
    if (!result.ok) {
      return HttpResponse.json(errorBody('認証失敗', 401), { status: 401 });
    }
    const body = result.data;
    const user = db.users.find((u) => u.username === body.username && u.password === body.password);
    if (!user || !user.enabled) {
      return HttpResponse.json(errorBody('認証失敗', 401), { status: 401 });
    }
    return HttpResponse.json({ token: issueToken(user.id), expiresIn: 3600 });
  }),

  http.get(`${API}/auth/me`, ({ request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    return HttpResponse.json(stripPassword(me));
  }),

  // 記事
  http.get(`${API}/articles`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword')?.toLowerCase();
    const tag = url.searchParams.get('tag');
    let list = db.articles.slice();
    if (keyword) list = list.filter((a) => a.title.toLowerCase().includes(keyword));
    if (tag) list = list.filter((a) => a.tags.includes(tag));
    return HttpResponse.json(paginate(list, url).map(toArticleSummary));
  }),

  http.post(`${API}/articles`, async ({ request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const result = await parseBody(request, ArticleCreateRequestSchema);
    if (!result.ok) return result.response;
    const body = result.data;
    const tagError = validateTagsUnique(body.tags);
    if (tagError) return badRequest(tagError);
    const article = {
      id: db.nextArticleId++,
      title: body.title,
      content: body.content,
      author: me.username,
      tags: body.tags ?? [],
      createdAt: currentTimestamp(),
      updatedAt: currentTimestamp(),
    };
    db.articles.push(article);
    return HttpResponse.json(article, { status: 201 });
  }),

  http.get(`${API}/articles/:id`, ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const id = Number(params.id);
    const article = db.articles.find((a) => a.id === id);
    if (!article) return notFound();
    return HttpResponse.json(article);
  }),

  http.put(`${API}/articles/:id`, async ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const id = Number(params.id);
    const article = db.articles.find((a) => a.id === id);
    if (!article) return notFound();
    if (article.author !== me.username && me.role !== 'ADMIN') {
      return forbidden();
    }
    const result = await parseBody(request, ArticleUpdateRequestSchema);
    if (!result.ok) return result.response;
    const body = result.data;
    const tagError = validateTagsUnique(body.tags);
    if (tagError) return badRequest(tagError);
    const latestVersion = Math.max(
      0,
      ...db.histories.filter((h) => h.articleId === id).map((h) => h.version),
    );
    db.histories.push({
      id: db.nextHistoryId++,
      articleId: id,
      title: article.title,
      content: article.content,
      version: latestVersion + 1,
      editedBy: me.username,
      editedAt: currentTimestamp(),
    });
    if (body.title !== undefined) article.title = body.title;
    if (body.content !== undefined) article.content = body.content;
    if (body.tags !== undefined) article.tags = body.tags;
    article.updatedAt = currentTimestamp();
    return HttpResponse.json(article);
  }),

  http.delete(`${API}/articles/:id`, ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const id = Number(params.id);
    const idx = db.articles.findIndex((a) => a.id === id);
    if (idx < 0) return notFound();
    if (db.articles[idx].author !== me.username && me.role !== 'ADMIN') {
      return forbidden();
    }
    db.articles.splice(idx, 1);
    // 関連 histories / comments も削除 (DB の ON DELETE CASCADE と同等)
    db.histories = db.histories.filter((h) => h.articleId !== id);
    db.comments = db.comments.filter((c) => c.articleId !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // 履歴
  http.get(`${API}/articles/:id/histories`, ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const id = Number(params.id);
    if (!db.articles.some((a) => a.id === id)) return notFound();
    const list = db.histories
      .filter((h) => h.articleId === id)
      .sort((a, b) => b.version - a.version)
      .map(toHistorySummary);
    return HttpResponse.json(list);
  }),

  http.get(`${API}/articles/:id/histories/:historyId`, ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const articleId = Number(params.id);
    const historyId = Number(params.historyId);
    const history = db.histories.find((h) => h.articleId === articleId && h.id === historyId);
    if (!history) return notFound();
    return HttpResponse.json(history);
  }),

  // コメント
  http.get(`${API}/articles/:id/comments`, ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const id = Number(params.id);
    if (!db.articles.some((a) => a.id === id)) return notFound();
    const url = new URL(request.url);
    const list = db.comments.filter((c) => c.articleId === id);
    return HttpResponse.json(paginate(list, url));
  }),

  http.post(`${API}/articles/:id/comments`, async ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    const id = Number(params.id);
    if (!db.articles.some((a) => a.id === id)) return notFound();
    const result = await parseBody(request, CommentCreateRequestSchema);
    if (!result.ok) return result.response;
    const body = result.data;
    const comment = {
      id: db.nextCommentId++,
      articleId: id,
      userId: me.id,
      author: me.username,
      content: body.content,
      createdAt: currentTimestamp(),
    };
    db.comments.push(comment);
    return HttpResponse.json(comment, { status: 201 });
  }),

  // 管理者: ユーザー管理
  http.get(`${API}/admin/users`, ({ request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    if (me.role !== 'ADMIN') return forbidden();
    const url = new URL(request.url);
    return HttpResponse.json(paginate(db.users, url).map(stripPassword));
  }),

  http.patch(`${API}/admin/users/:userId`, async ({ params, request }) => {
    const me = userFromAuthHeader(request);
    if (!me) return unauthorized();
    if (me.role !== 'ADMIN') return forbidden();
    const userId = Number(params.userId);
    const target = db.users.find((u) => u.id === userId);
    if (!target) return notFound();
    const result = await parseBody(request, UserUpdateRequestSchema);
    if (!result.ok) return result.response;
    const body = result.data;
    if (body.role !== undefined) target.role = body.role;
    if (body.enabled !== undefined) target.enabled = body.enabled;
    return HttpResponse.json(stripPassword(target));
  }),
];
