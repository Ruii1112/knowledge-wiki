import { z } from 'zod';

// ============================================
// API server schemas (OpenAPI と同期)
// フォーム都合の検証はここに含めない (features/*/schemas.ts に分離)
// ============================================

// 共通 helper: 文字列が trim 後に最低1文字を含むか
const requiredString = (msg: string) =>
  z.string().refine((s) => s.trim().length > 0, { message: msg });

export const TagSchema = z.string().min(1).max(100);

export const UserRoleSchema = z.enum(['USER', 'ADMIN']);

export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  enabled: z.boolean(),
  createdAt: z.string(),
});

export const UserListSchema = z.array(UserSchema);

export const UserUpdateRequestSchema = z.object({
  role: UserRoleSchema.optional(),
  enabled: z.boolean().optional(),
});

// ============================================
// Auth (server contract)
// ============================================

export const LoginRequestSchema = z.object({
  username: requiredString('ユーザー名は必須です'),
  password: requiredString('パスワードは必須です'),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  expiresIn: z.number().int().positive(),
});

export const SignupRequestSchema = z.object({
  username: z
    .string()
    .refine((s) => s.trim().length >= 3, {
      message: 'ユーザー名は3文字以上である必要があります',
    })
    .refine((s) => s.length <= 50, {
      message: 'ユーザー名は50文字以下である必要があります',
    }),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(/[A-Z]/, 'パスワードは大文字を含む必要があります')
    .regex(/[a-z]/, 'パスワードは小文字を含む必要があります')
    .regex(/[0-9]/, 'パスワードは数字を含む必要があります'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type User = z.infer<typeof UserSchema>;
export type Role = z.infer<typeof UserRoleSchema>;
export type UserUpdateRequest = z.infer<typeof UserUpdateRequestSchema>;

// ============================================
// Articles
// ============================================

export const ArticleSummarySchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  author: z.string(),
  tags: z.array(TagSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ArticleSummaryListSchema = z.array(ArticleSummarySchema);

export const ArticleDetailSchema = ArticleSummarySchema.extend({
  content: z.string(),
});

// API契約: tags は optional (OpenAPI は required: [title, content] のみ)
export const ArticleCreateRequestSchema = z.object({
  title: requiredString('タイトルは必須です').pipe(
    z.string().max(200, 'タイトルは200文字以下です'),
  ),
  content: requiredString('本文は必須です'),
  tags: z.array(TagSchema).optional(),
});

export const ArticleUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(TagSchema).optional(),
});

export type ArticleSummary = z.infer<typeof ArticleSummarySchema>;
export type ArticleDetail = z.infer<typeof ArticleDetailSchema>;
export type ArticleCreateRequest = z.infer<typeof ArticleCreateRequestSchema>;
export type ArticleUpdateRequest = z.infer<typeof ArticleUpdateRequestSchema>;

// ============================================
// History
// ============================================

export const HistorySummarySchema = z.object({
  id: z.number().int().positive(),
  version: z.number().int().positive(),
  editedBy: z.string(),
  editedAt: z.string(),
});

export const HistorySummaryListSchema = z.array(HistorySummarySchema);

export const HistoryDetailSchema = HistorySummarySchema.extend({
  articleId: z.number().int().positive(),
  title: z.string(),
  content: z.string(),
});

export type HistorySummary = z.infer<typeof HistorySummarySchema>;
export type HistoryDetail = z.infer<typeof HistoryDetailSchema>;

// ============================================
// Comment
// ============================================

export const CommentSchema = z.object({
  id: z.number().int().positive(),
  articleId: z.number().int().positive(),
  userId: z.number().int().positive(),
  author: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export const CommentListSchema = z.array(CommentSchema);

export const CommentCreateRequestSchema = z.object({
  content: requiredString('コメント本文を入力してください'),
});

export type Comment = z.infer<typeof CommentSchema>;
export type CommentCreateRequest = z.infer<typeof CommentCreateRequestSchema>;
