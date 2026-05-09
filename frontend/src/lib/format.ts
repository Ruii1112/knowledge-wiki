const pad = (n: number) => String(n).padStart(2, '0');

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
