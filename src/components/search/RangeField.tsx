// components/search/RangeField.tsx
'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

function formatNumberPL(n?: number | null) {
  if (n === null || n === undefined) return '';
  return new Intl.NumberFormat('pl-PL').format(n);
}
function parseIntSafe(v: string): number | null {
  const n = Number(v.replace(/\s/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function RangeField({
  id,
  label,
  unit,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  id: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  value: [number | null, number | null];
  onChange: (next: [number | null, number | null]) => void;
}) {
  const [minVal, maxVal] = value;
  const effMin = minVal ?? min;
  const effMax = maxVal ?? max;

  // clamp + swap w granicach kompon.
  function update([a, b]: [number, number]) {
    let lo = Math.max(min, Math.min(a, max));
    let hi = Math.max(min, Math.min(b, max));
    if (lo > hi) [lo, hi] = [hi, lo];
    onChange([lo, hi]);
  }

  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-1 text-green-700'>
          <input
            aria-label={`${label} od`}
            className='w-28 bg-transparent text-green-700 font-medium outline-none border-b border-transparent focus:border-green-600'
            value={minVal === null ? '' : formatNumberPL(minVal)}
            onChange={e => onChange([parseIntSafe(e.target.value), maxVal])}
          />
          {unit && <span className='text-sm'>{unit}</span>}
        </div>

        <span className='text-muted-foreground'>–</span>

        <div className='flex items-center gap-1 text-green-700'>
          <input
            aria-label={`${label} do`}
            className='w-28 bg-transparent text-green-700 font-medium outline-none border-b border-transparent focus:border-green-600'
            value={maxVal === null ? '' : formatNumberPL(maxVal)}
            onChange={e => onChange([minVal, parseIntSafe(e.target.value)])}
          />
          {unit && <span className='text-sm'>{unit}</span>}
        </div>
      </div>

      <Slider
        min={min}
        max={max}
        step={step}
        value={[effMin, effMax]}
        onValueChange={([a, b]) => update([a, b])}
      />
    </div>
  );
}
