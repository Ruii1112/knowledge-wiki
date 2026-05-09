import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime } from './format';

// new Date(iso) はローカルタイムを返すため、TZ依存を避けるテストは
// 12:00 UTC の入力を使い「UTC でも JST でも日付が変わらない」値を選ぶ
const NOON_UTC = '2026-03-05T12:00:00.000Z';
const MIDNIGHT_UTC = '2026-03-05T00:00:00.000Z'; // JST だと翌日 09:00

describe('formatDate', () => {
  it('UTC 正午は YYYY/MM/DD で 2026/03/05', () => {
    expect(formatDate(NOON_UTC)).toBe('2026/03/05');
  });
  it('zero-padding (1月3日)', () => {
    expect(formatDate('2026-01-03T12:00:00.000Z')).toBe('2026/01/03');
  });
  it('TZ 依存だが JST/UTC どちらでも UTC 0時は 2026/03/05 か 2026/03/04', () => {
    expect(['2026/03/04', '2026/03/05']).toContain(formatDate(MIDNIGHT_UTC));
  });
});

describe('formatDateTime', () => {
  it('UTC 正午を含む値で日付部が 2026/03/05', () => {
    expect(formatDateTime(NOON_UTC)).toMatch(/^2026\/03\/05 \d{2}:\d{2}$/);
  });
  it('時刻部の zero-padding', () => {
    // JSTなら 12:00 UTC = 21:00、UTCなら 12:00 → どちらも HH:MM で2桁
    expect(formatDateTime(NOON_UTC).split(' ')[1]).toMatch(/^\d{2}:\d{2}$/);
  });
});
