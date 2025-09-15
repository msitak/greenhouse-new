// components/HtmlContent.tsx
'use client';

import * as React from 'react';
import DOMPurify from 'isomorphic-dompurify';

type HtmlContentProps = {
  html: string | null | undefined;
  className?: string;
};

const ALLOWED_TAGS = [
  'p',
  'ul',
  'ol',
  'li',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'a',
] as const;

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel'] as const;

export default function HtmlContent({ html, className }: HtmlContentProps) {
  const clean = React.useMemo(() => {
    const base = html ?? '';

    // 1) Sanityzacja z twardą białą listą
    const sanitized = DOMPurify.sanitize(base, {
      ALLOWED_TAGS: ALLOWED_TAGS as unknown as string[],
      ALLOWED_ATTR: ALLOWED_ATTR as unknown as string[],
      FORBID_TAGS: ['style', 'script'],
      FORBID_ATTR: ['style', 'on*'], // wycina onClick, onError itp.
      USE_PROFILES: { html: true }, // bez SVG/MathML
    });

    // 2) Twarde zabezpieczenie linków (jeśli jakieś przepuszczasz)
    //    dodaj target+rel tylko gdy jest href
    return sanitized.replace(
      /<a\s+([^>]*href=['"][^'"]+['"][^>]*)>/gi,
      (m, g1) => `<a ${g1} target="_blank" rel="noopener noreferrer">`
    );
  }, [html]);

  if (!clean) return null;

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
