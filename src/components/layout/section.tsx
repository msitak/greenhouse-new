import { cn } from '@/lib/utils';
import React from 'react';

type SectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export default function Section({ id, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(id === 'hero' ? 'full-bleed' : undefined, className)}
    >
      {children}
    </section>
  );
}
