// lib/range/utils.ts
export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function formatNumberPL(n: number): string {
  return new Intl.NumberFormat('pl-PL').format(n);
}

// Akceptuje spacje / &nbsp; / . / , jako separatory tys. + sufiksy k/tys/m/mln
export function parseHumanInt(input: string): number | null {
  if (!input) return null;
  let s = input
    .toString()
    .replace(/\u00A0/g, ' ')
    .trim()
    .toLowerCase();
  let mul = 1;
  if (/(k|tys)\b/.test(s)) {
    mul = 1_000;
    s = s.replace(/(k|tys)\b/g, '');
  }
  if (/(m|mln)\b/.test(s)) {
    mul = 1_000_000;
    s = s.replace(/(m|mln)\b/g, '');
  }
  s = s.replace(/\s+/g, '').replace(/(?<=\d)[.,](?=\d{3}\b)/g, '');
  s = s.replace(/[,\.](\d+).*/, '.$1');
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * mul);
}

// Slider config (liniowy)
export function sliderConfig(min: number, max: number, step: number) {
  return { min, max, step };
}

// minimalna odległość w krokach suwaka
export function stepsForMinDistance(
  minDistance: number | undefined,
  step: number
) {
  if (!minDistance) return 0;
  return Math.max(0, Math.ceil(minDistance / step));
}
