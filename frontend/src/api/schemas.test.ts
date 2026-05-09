import { describe, expect, it } from 'vitest';
import {
  ArticleCreateRequestSchema,
  CommentCreateRequestSchema,
  LoginRequestSchema,
  SignupRequestSchema,
  TagSchema,
  UserSchema,
} from './schemas';

describe('TagSchema', () => {
  it('1〜100文字を受け入れる', () => {
    expect(TagSchema.safeParse('a').success).toBe(true);
    expect(TagSchema.safeParse('a'.repeat(100)).success).toBe(true);
  });
  it('空文字 / 100超 を弾く', () => {
    expect(TagSchema.safeParse('').success).toBe(false);
    expect(TagSchema.safeParse('a'.repeat(101)).success).toBe(false);
  });
});

describe('LoginRequestSchema', () => {
  it('whitespace-only を弾く (trim 検証)', () => {
    expect(LoginRequestSchema.safeParse({ username: '   ', password: 'pw' }).success).toBe(false);
    expect(LoginRequestSchema.safeParse({ username: 'u', password: '   ' }).success).toBe(false);
  });
  it('正常入力で通る', () => {
    expect(LoginRequestSchema.safeParse({ username: 'u', password: 'pw' }).success).toBe(true);
  });
});

describe('SignupRequestSchema', () => {
  it('email 不正・短い username を弾く', () => {
    expect(
      SignupRequestSchema.safeParse({
        username: 'ab',
        email: 'invalid',
        password: 'Password1',
      }).success,
    ).toBe(false);
  });
  it('パスワード強度不足を弾く', () => {
    expect(
      SignupRequestSchema.safeParse({
        username: 'user',
        email: 'a@b.co',
        password: 'short',
      }).success,
    ).toBe(false);
    expect(
      SignupRequestSchema.safeParse({
        username: 'user',
        email: 'a@b.co',
        password: 'alllowercase1',
      }).success,
    ).toBe(false);
  });
});

describe('ArticleCreateRequestSchema', () => {
  it('whitespace-only タイトル/本文を弾く', () => {
    expect(
      ArticleCreateRequestSchema.safeParse({
        title: '   ',
        content: 'x',
      }).success,
    ).toBe(false);
    expect(
      ArticleCreateRequestSchema.safeParse({
        title: 'x',
        content: '\n\n  ',
      }).success,
    ).toBe(false);
  });
  it('200字超のタイトルを弾く', () => {
    expect(
      ArticleCreateRequestSchema.safeParse({
        title: 'a'.repeat(201),
        content: 'x',
      }).success,
    ).toBe(false);
  });
  it('tags は省略可', () => {
    const r = ArticleCreateRequestSchema.safeParse({ title: 't', content: 'c' });
    expect(r.success).toBe(true);
  });
});

describe('CommentCreateRequestSchema', () => {
  it('whitespace-only を弾く', () => {
    expect(CommentCreateRequestSchema.safeParse({ content: '   ' }).success).toBe(false);
  });
});

describe('UserSchema', () => {
  it('role enum 外を弾く', () => {
    expect(
      UserSchema.safeParse({
        id: 1,
        username: 'u',
        email: 'a@b.co',
        role: 'GUEST',
        enabled: true,
        createdAt: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(false);
  });
});
