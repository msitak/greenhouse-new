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
  const minDisplay = dragSlider ? R.format(sliderValue[0]) : R.minText;
  const maxDisplay = dragSlider ? R.format(sliderValue[1]) : R.maxText;

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
      {/* Desktop (lg+): inline label + inputs row; tablet/mobile use the below-mobile layout */}
      <div className='hidden lg:flex items-center gap-2 justify-end items-center'>
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
            value={minDisplay}
            onChange={e => R.changeMinText(e.target.value)}
            onBlur={R.commitMin}
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
            value={maxDisplay}
            onChange={e => R.changeMaxText(e.target.value)}
            onBlur={R.commitMax}
          />
          {unit && (
            <span className='text-sm text-muted-foreground'>{unit}</span>
          )}
        </div>
      </div>

      {/* Mobile/Tablet label */}
      <div className='flex items-center justify-between lg:hidden'>
        <Label htmlFor={id} className='block'>
          {label}
        </Label>
      </div>

      {/* SLIDER */}
      <div className='mt-2'>
        <Slider
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          minStepsBetweenThumbs={minSteps}
          value={sliderValue}
          onValueChange={onSliderChange}
          onValueCommit={onSliderCommit}
        />
        <div className='mt-1 hidden md:flex justify-between text-xs text-muted-foreground'>
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

      {/* INPUTS — mobile/tablet-only, below slider */}
      <div className='mt-3 flex items-center justify-between gap-6 lg:hidden'>
        <div className='flex items-center rounded-xl bg-[#F7F7F7] md:bg-white px-3 py-2 w-[140px]'>
          <input
            inputMode='numeric'
            aria-label={`${label} od`}
            className={cn(
              'bg-transparent outline-none border-0 text-left md:text-right text-[14px]/[20px] text-[#6E6E6E] w-full'
            )}
            value={minDisplay}
            onChange={e => R.changeMinText(e.target.value)}
            onBlur={R.commitMin}
          />
          {unit && <span className='ml-2 text-sm text-[#212121]'>{unit}</span>}
        </div>

        <div className='flex items-center rounded-xl bg-[#F7F7F7] md:bg-white px-3 py-2 w-[140px]'>
          <input
            inputMode='numeric'
            aria-label={`${label} do`}
            className={cn(
              'bg-transparent outline-none border-0 text-left md:text-right text-[14px]/[20px] text-[#6E6E6E] w-full'
            )}
            value={maxDisplay}
            onChange={e => R.changeMaxText(e.target.value)}
            onBlur={R.commitMax}
          />
          {unit && <span className='ml-2 text-sm text-[#212121]'>{unit}</span>}
        </div>
      </div>
    </div>
  );
}
