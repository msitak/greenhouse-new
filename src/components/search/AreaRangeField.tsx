// components/search/AreaRangeField.tsx
'use client';

import { DualRange, type DualRangeProps } from './DualRange';

// Allow overriding min/max/step from props so we can base it on real data
type AreaProps = Omit<DualRangeProps, 'label' | 'unit' | 'min' | 'max' | 'step'> & {
	min?: number;
	max?: number;
	step?: number;
};

export function AreaRangeField(props: AreaProps) {
	return (
		<DualRange
			id={props.id}
			label='Powierzchnia'
			unit='m²'
			min={props.min ?? 0}
			max={props.max ?? 1000}
			step={props.step ?? 1}
			value={props.value}
			onChange={props.onChange}
			minDistance={props.minDistance ?? (props.step ?? 1)}
			className={props.className}
			updateStrategy={props.updateStrategy ?? 'throttle'}
		/>
	);
}
