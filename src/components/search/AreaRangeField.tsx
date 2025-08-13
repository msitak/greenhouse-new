// components/search/AreaRangeField.tsx
'use client';

import { DualRange, type DualRangeProps } from './DualRange';

export function AreaRangeField(
  props: Omit<DualRangeProps, 'label' | 'unit' | 'min' | 'max' | 'step'>
) {
  return (
    <DualRange
      id={props.id}
      label='Powierzchnia'
      unit='m²'
      min={0}
      max={1000}
      step={1}
      value={props.value}
      onChange={props.onChange}
      minDistance={1}
      className={props.className}
      updateStrategy={props.updateStrategy ?? 'throttle'}
    />
  );
}
