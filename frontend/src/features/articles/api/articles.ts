import {
  ArticleDetailSchema,
  ArticleSummaryListSchema,
  CommentListSchema,
  CommentSchema,
  HistoryDetailSchema,
  HistorySummaryListSchema,
  type ArticleCreateRequest,
  type ArticleDetail,
  type ArticleSummary,
  type ArticleUpdateRequest,
  type Comment,
  type CommentCreateRequest,
  type HistoryDetail,
  type HistorySummary,
} from '../../../api/schemas';
import { api } from '../../../lib/apiClient';

export interface ArticleSearchParams {
  keyword?: string;
  tag?: string;
  page?: number;
  size?: number;
}

export const articlesApi = {
  list: (params: ArticleSearchParams = {}) =>
    api.get<ArticleSummary[]>('/articles', {
      query: { ...params },
      auth: false,
      schema: ArticleSummaryListSchema,
    }),
  get: (id: number) => api.get<ArticleDetail>(`/articles/${id}`, { schema: ArticleDetailSchema }),
  create: (body: ArticleCreateRequest) =>
    api.post<ArticleDetail>('/articles', body, { schema: ArticleDetailSchema }),
  update: (id: number, body: ArticleUpdateRequest) =>
    api.put<ArticleDetail>(`/articles/${id}`, body, { schema: ArticleDetailSchema }),
  remove: (id: number) => api.delete<void>(`/articles/${id}`),

  histories: (articleId: number) =>
    api.get<HistorySummary[]>(`/articles/${articleId}/histories`, {
      schema: HistorySummaryListSchema,
    }),
  history: (articleId: number, historyId: number) =>
    api.get<HistoryDetail>(`/articles/${articleId}/histories/${historyId}`, {
      schema: HistoryDetailSchema,
    }),

  comments: (articleId: number, params: { page?: number; size?: number } = {}) =>
    api.get<Comment[]>(`/articles/${articleId}/comments`, {
      query: { ...params },
      schema: CommentListSchema,
    }),
  postComment: (articleId: number, body: CommentCreateRequest) =>
    api.post<Comment>(`/articles/${articleId}/comments`, body, {
      schema: CommentSchema,
    }),
};
