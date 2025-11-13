'use client';

import { useState, useEffect } from 'react';

type Heading = {
  text: string;
  style: string;
};

type TableOfContentsProps = {
  headings: Heading[];
};

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66% 0px',
        threshold: 0,
      }
    );

    // Observe all heading elements
    headings.forEach((_, index) => {
      const element = document.getElementById(`heading-${index}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((_, index) => {
        const element = document.getElementById(`heading-${index}`);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
      // Update URL without triggering scroll
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <aside className='hidden lg:block'>
      <nav className='sticky top-8'>
        <h2 className='text-base font-bold mb-4'>Spis treści</h2>
        <ul className='space-y-3 list-disc ml-4 text-[18px]/[28px]'>
          {headings.map((heading: Heading, index: number) => {
            const isActive = activeId === `heading-${index}`;
            return (
              <li key={index}>
                <a
                  href={`#heading-${index}`}
                  onClick={e => handleClick(e, `heading-${index}`)}
                  className={`text-sm transition-colors duration-300 block relative ${
                    isActive
                      ? 'text-green-primary font-bold'
                      : 'text-[#8E8E8E] hover:text-green-primary'
                  }`}
                  style={{
                    display: 'inline-block',
                  }}
                >
                  {/* Invisible bold text to reserve space */}
                  <span
                    className='font-bold invisible block h-0 overflow-hidden'
                    aria-hidden='true'
                  >
                    {heading.text}
                  </span>
                  {/* Actual visible text */}
                  <span className='block'>{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
