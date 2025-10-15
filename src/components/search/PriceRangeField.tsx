// components/search/PriceRangeField.tsx
'use client';

import { DualRange, type DualRangeProps } from './DualRange';

type Props = Omit<
  DualRangeProps,
  'label' | 'unit' | 'min' | 'max' | 'step'
> & {
  dealType?: 'sale' | 'rent';
  min?: number;
  max?: number;
  step?: number;
};

export function PriceRangeField(props: Props) {
  const sale = props.dealType !== 'rent';
  const fallbackMin = 0;
  const fallbackMax = sale ? 2_000_000 : 20_000;
  const fallbackStep = sale ? 5_000 : 50;
  const minDistanceFallback = fallbackStep;

  return (
    <DualRange
      id={props.id}
      label='Cena'
      unit='zł'
      min={props.min ?? fallbackMin}
      max={props.max ?? fallbackMax}
      step={props.step ?? fallbackStep}
      value={props.value}
      onChange={props.onChange}
      minDistance={props.minDistance ?? minDistanceFallback}
      className={props.className}
      updateStrategy={props.updateStrategy ?? 'commit'}
    />
  );
}
