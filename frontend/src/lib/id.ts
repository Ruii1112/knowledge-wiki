// URL から取得したID文字列を厳密に検証する。
// "1e2" や "1.0" など Number() で通る値も弾く。
const POSITIVE_INT = /^[1-9]\d*$/;

export const parsePositiveId = (raw: string | undefined): number | null => {
  if (!raw) return null;
  if (!POSITIVE_INT.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
};
