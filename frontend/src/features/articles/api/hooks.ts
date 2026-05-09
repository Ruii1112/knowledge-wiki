import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ArticleCreateRequest,
  ArticleUpdateRequest,
  CommentCreateRequest,
} from '../../../api/schemas';
import { queryKeys } from '../../../lib/queryKeys';
import { articlesApi, type ArticleSearchParams } from './articles';

export function useArticlesQuery(params: ArticleSearchParams) {
  return useQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: () => articlesApi.list(params),
  });
}

export function useArticleQuery(id: number | null) {
  return useQuery({
    queryKey: id !== null ? queryKeys.articles.detail(id) : ['articles', 'detail', null],
    queryFn: () => articlesApi.get(id as number),
    enabled: id !== null,
  });
}

export function useCreateArticleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ArticleCreateRequest) => articlesApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

export function useUpdateArticleMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ArticleUpdateRequest) => articlesApi.update(id, body),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.articles.detail(id), data);
      qc.invalidateQueries({ queryKey: queryKeys.articles.all });
      qc.invalidateQueries({ queryKey: queryKeys.articles.histories(id) });
    },
  });
}

export function useDeleteArticleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => articlesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.articles.all });
    },
  });
}

export function useHistoriesQuery(articleId: number | null) {
  return useQuery({
    queryKey:
      articleId !== null
        ? queryKeys.articles.histories(articleId)
        : ['articles', null, 'histories'],
    queryFn: () => articlesApi.histories(articleId as number),
    enabled: articleId !== null,
  });
}

export function useHistoryQuery(articleId: number | null, historyId: number | null) {
  return useQuery({
    queryKey:
      articleId !== null && historyId !== null
        ? queryKeys.articles.history(articleId, historyId)
        : ['articles', null, 'histories', null],
    queryFn: () => articlesApi.history(articleId as number, historyId as number),
    enabled: articleId !== null && historyId !== null,
  });
}

export function useCommentsQuery(articleId: number | null) {
  return useQuery({
    queryKey:
      articleId !== null ? queryKeys.articles.comments(articleId) : ['articles', null, 'comments'],
    queryFn: () => articlesApi.comments(articleId as number),
    enabled: articleId !== null,
  });
}

export function usePostCommentMutation(articleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CommentCreateRequest) => articlesApi.postComment(articleId, body),
    onSuccess: () => {
      // ページング付き comments を refetch (単純 append だと page 境界で drift)
      qc.invalidateQueries({ queryKey: queryKeys.articles.comments(articleId) });
    },
  });
}
