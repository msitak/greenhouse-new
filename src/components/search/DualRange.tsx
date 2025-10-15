// components/search/DualRange.tsx
'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRange, type RangeValue } from '@/lib/hooks/useRange';
import { clamp, sliderConfig, stepsForMinDistance } from '@/lib/utils/range';
import { cn } from '@/lib/utils';

export type DualRangeProps = {
  id: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  onChange: (v: RangeValue) => void;
  minDistance?: number;
  className?: string;

  /** Jak emitujemy zmiany do rodzica:
   * 'live'      - na każdy ruch
   * 'throttle'  - przez rAF (20–60 FPS)
   * 'commit'    - tylko po puszczeniu suwaka (najpłynniej)
   */
  updateStrategy?: 'live' | 'throttle' | 'commit';
};

export function DualRange({
  id,
  label,
  unit,
  min,
  max,
  step = 1,
  value,
  onChange,
  minDistance,
  className,
  updateStrategy = 'commit',
}: DualRangeProps) {
  const R = useRange({ min, max, step, value, onChange });

  const effMin = R.lo ?? min;
  const effMax = R.hi ?? max;

  const cfg = sliderConfig(min, max, step);
  const committedSlider: [number, number] = [effMin, effMax];

  // lokalny stan podczas przeciągania (wprost w jednostkach domeny)
  const [dragSlider, setDragSlider] = React.useState<[number, number] | null>(
    null
  );
  const rafId = React.useRef<number | null>(null);
  const pending = React.useRef<[number, number] | null>(null);

  const sliderValue = dragSlider ?? committedSlider;
  const minSteps = stepsForMinDistance(minDistance, step);

  function emit([a, b]: [number, number]) {
    let lo = clamp(a, min, max);
    let hi = clamp(b, min, max);
    if (lo > hi) [lo, hi] = [hi, lo];
    onChange([lo, hi]);
  }

  function onSliderChange([a, b]: [number, number]) {
    setDragSlider([a, b]);
    if (updateStrategy === 'live') {
      emit([a, b]);
    } else if (updateStrategy === 'throttle') {
      pending.current = [a, b];
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          rafId.current = null;
          if (pending.current) {
            emit(pending.current);
            pending.current = null;
          }
        });
      }
    }
  }
  function onSliderCommit([a, b]: [number, number]) {
    emit([a, b]);
    setDragSlider(null);
  }

  return (
    <div className={className}>

      {/* INPUTY — swobodne wpisywanie, korekta dopiero na blur/Enter */}
      <div className='flex items-center gap-2 justify-end items-center'>
        <Label htmlFor={id} className='block mr-auto'>
          {label}
        </Label>
        <div className='flex items-center gap-1'>
          <input
            inputMode='numeric'
            aria-label={`${label} od`}
            className={cn(
              'w-22 bg-transparent text-right text-primary font-medium outline-none border-b border-transparent focus:border-primary'
            )}
            value={R.minText}
            onChange={e => R.changeMinText(e.target.value)}
            onBlur={R.commitMin}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                R.bumpMin(e.shiftKey ? 10 : 1);
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                R.bumpMin(e.shiftKey ? -10 : -1);
              }
            }}
          />
          {unit && (
            <span className='text-sm text-muted-foreground'>{unit}</span>
          )}
        </div>

        <span className='text-muted-foreground'>–</span>

        <div className='flex items-center gap-1'>
          <input
            inputMode='numeric'
            aria-label={`${label} do`}
            className={cn(
              'w-22 bg-transparent text-right text-primary font-medium outline-none border-b border-transparent focus:border-primary'
            )}
            value={R.maxText}
            onChange={e => R.changeMaxText(e.target.value)}
            onBlur={R.commitMax}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                R.bumpMax(e.shiftKey ? 10 : 1);
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                R.bumpMax(e.shiftKey ? -10 : -1);
              }
            }}
          />
          {unit && (
            <span className='text-sm text-muted-foreground'>{unit}</span>
          )}
        </div>
      </div>

      {/* SLIDER */}
      <div className='mt-3'>
        <Slider
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          minStepsBetweenThumbs={minSteps}
          value={sliderValue}
          onValueChange={onSliderChange}
          onValueCommit={onSliderCommit}
        />
        <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
          <span>
            {R.format(min)}
            {unit ? ` ${unit}` : ''}
          </span>
          <span>
            {R.format(max)}
            {unit ? ` ${unit}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
