import { describe, expect, it } from 'vitest';
import { parsePositiveId } from './id';

describe('parsePositiveId', () => {
  it.each([
    ['1', 1],
    ['42', 42],
    ['9007199254740991', 9007199254740991], // MAX_SAFE_INTEGER
  ])('正の整数 "%s" を %i として返す', (input, expected) => {
    expect(parsePositiveId(input)).toBe(expected);
  });

  const invalid: { input: string | undefined; label: string }[] = [
    { input: '0', label: 'leading 0' },
    { input: '01', label: 'leading zero' },
    { input: '-1', label: '負' },
    { input: '1.5', label: '小数' },
    { input: '1e2', label: '指数表記' },
    { input: 'Infinity', label: 'Infinity' },
    { input: 'abc', label: '英字' },
    { input: '', label: '空文字' },
    { input: undefined, label: 'undefined' },
    { input: '9007199254740993', label: 'MAX_SAFE_INTEGER 超' },
  ];
  it.each(invalid)('$label を null として弾く', ({ input }) => {
    expect(parsePositiveId(input)).toBeNull();
  });
});
