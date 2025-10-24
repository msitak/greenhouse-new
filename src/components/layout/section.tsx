import { cn } from '@/lib/utils';
import React from 'react';

type SectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ id, className, children, style }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(id === 'hero' ? 'full-bleed' : undefined, className)}
        style={style}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export default Section;
