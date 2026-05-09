import type { ZodSchema } from 'zod';

interface ErrorResponseBody {
  message?: string;
  status?: number;
  timestamp?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'auth.token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = `HTTP_${status}`;
    this.status = status;
  }
}

export class ResponseValidationError extends Error {
  cause: unknown;
  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'ResponseValidationError';
    this.cause = cause;
  }
}

// 認証付きリクエストで 401 が返ったときのフック (token 失効検出)
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

interface RequestOptions<T> extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
  /** レスポンス JSON を実行時に検証する Zod schema (任意) */
  schema?: ZodSchema<T>;
}

const buildUrl = (path: string, query?: RequestOptions<unknown>['query']) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
};

const messageFor = (status: number, fallback: string) => {
  if (status === 401) return '認証が必要です';
  if (status === 403) return '権限がありません';
  if (status === 404) return '対象が見つかりません';
  return fallback;
};

export async function apiRequest<T>(
  path: string,
  { body, query, auth = true, headers, schema, ...init }: RequestOptions<T> = {},
): Promise<T> {
  const finalHeaders = new Headers(headers);
  if (body !== undefined) finalHeaders.set('Content-Type', 'application/json');

  if (auth) {
    const token = tokenStorage.get();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    let message = messageFor(response.status, 'リクエストに失敗しました');
    try {
      const data = (await response.json()) as ErrorResponseBody;
      if (data?.message) message = data.message;
    } catch {
      // ignore JSON parse error
    }
    if (response.status === 401 && auth && tokenStorage.get() && onUnauthorized) {
      onUnauthorized();
    }
    throw new ApiError(message, response.status);
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('application/json')) return undefined as T;

  const json = await response.json();
  if (!schema) return json as T;

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ResponseValidationError('API レスポンスの形式が想定と異なります', parsed.error);
  }
  return parsed.data;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions<T>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions<T>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions<T>) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions<T>) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: RequestOptions<T>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};
