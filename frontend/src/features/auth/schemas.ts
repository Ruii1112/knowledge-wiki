import { z } from 'zod';
import { SignupRequestSchema } from '../../api/schemas';

// 登録フォーム独自: confirmPassword + 一致検証 (API契約には含めない)
export const SignupFormSchema = SignupRequestSchema.extend({
  confirmPassword: z.string().min(1, 'パスワードの確認は必須です'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

export type SignupFormValues = z.infer<typeof SignupFormSchema>;
