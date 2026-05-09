import { describe, expect, it } from 'vitest';
import { SignupFormSchema } from './schemas';

const valid = {
  username: 'newuser',
  email: 'new@example.com',
  password: 'Password1',
  confirmPassword: 'Password1',
};

describe('SignupFormSchema', () => {
  it('正常入力で通る', () => {
    expect(SignupFormSchema.safeParse(valid).success).toBe(true);
  });
  it('confirmPassword 不一致を弾く', () => {
    const r = SignupFormSchema.safeParse({ ...valid, confirmPassword: 'Other1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toContain('confirmPassword');
    }
  });
});
