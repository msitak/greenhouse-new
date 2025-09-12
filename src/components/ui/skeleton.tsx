import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('bg-[#f5f5f5] animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

type SkeletonBoxProps = {
  isLoading: boolean;
  className?: string; // controls size/shape
  placeholderClassName?: string; // background when not loading
};

function SkeletonBox({
  isLoading,
  className,
  placeholderClassName,
}: SkeletonBoxProps) {
  if (isLoading) {
    return <Skeleton className={className} />;
  }
  return (
    <div
      className={cn(
        'rounded-md',
        placeholderClassName ?? 'bg-[#f5f5f5]',
        className
      )}
      aria-hidden='true'
    />
  );
}

export { Skeleton, SkeletonBox };
