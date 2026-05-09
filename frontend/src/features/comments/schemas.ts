import { z } from 'zod';

const requiredString = (msg: string) =>
  z.string().refine((s) => s.trim().length > 0, { message: msg });

export const CommentFormSchema = z.object({
  content: requiredString('コメント本文を入力してください'),
});

export type CommentFormValues = z.infer<typeof CommentFormSchema>;
