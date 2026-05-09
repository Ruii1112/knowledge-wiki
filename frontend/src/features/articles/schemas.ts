import { z } from 'zod';
import { TagSchema } from '../../api/schemas';

const requiredString = (msg: string) =>
  z.string().refine((s) => s.trim().length > 0, { message: msg });

// フォーム入出力型を一致させるため tags は default なしで required-array を持たせる
export const ArticleFormSchema = z.object({
  title: requiredString('タイトルは必須です').pipe(
    z.string().max(200, 'タイトルは200文字以下です'),
  ),
  content: requiredString('本文は必須です'),
  tags: z.array(TagSchema),
});

export type ArticleFormValues = z.infer<typeof ArticleFormSchema>;
