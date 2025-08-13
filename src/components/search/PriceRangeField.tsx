// components/search/PriceRangeField.tsx
'use client';

import { DualRange, type DualRangeProps } from './DualRange';

export function PriceRangeField(
  props: Omit<DualRangeProps, 'label' | 'unit' | 'min' | 'max' | 'step'> & {
    dealType?: 'sale' | 'rent';
  }
) {
  const sale = props.dealType !== 'rent';
  return (
    <DualRange
      id={props.id}
      label='Cena'
      unit='zł'
      min={0}
      max={sale ? 2_000_000 : 20_000}
      step={sale ? 5_000 : 50}
      value={props.value}
      onChange={props.onChange}
      minDistance={sale ? 5_000 : 50}
      className={props.className}
      updateStrategy={props.updateStrategy ?? 'commit'}
    />
  );
}
