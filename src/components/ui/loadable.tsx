'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type LoadableProps<T extends React.ElementType> = {
  isLoading?: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  skeletonClassName?: string;
  as?: T;
  className?: string;
};

export default function Loadable<T extends React.ElementType = 'div'>({
  isLoading = false,
  children,
  skeleton,
  skeletonClassName,
  as,
  className,
  ...props
}: LoadableProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof LoadableProps<T>>) {
  const Comp = as || 'div';
  // Temporary simple simulation: always show skeleton for ~1s on mount
  const [simulating, setSimulating] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setSimulating(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const showSkeleton = isLoading || simulating;

  if (showSkeleton) {
    return (
      <Comp className={className} {...props}>
        {skeleton ?? <Skeleton className={cn(className, skeletonClassName)} />}
      </Comp>
    );
  }

  return (
    <Comp className={className} {...props}>
      {children}
    </Comp>
  );
}
