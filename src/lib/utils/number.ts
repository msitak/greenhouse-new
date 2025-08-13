export function formatNumberPL(n?: number | null): string {
  if (n === null || n === undefined) return '';
  return new Intl.NumberFormat('pl-PL').format(n);
}

export function parseIntSafe(v: string): number | null {
  const n = Number(v.replace(/\s/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function toNumberOrNull(x: unknown): number | null {
  const n = typeof x === 'string' ? Number(x) : (x as number);
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}
