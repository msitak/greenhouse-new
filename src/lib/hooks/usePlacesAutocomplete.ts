'use client';

import { useEffect, useRef, useState } from 'react';
import type { LocationValue } from '@/lib/location/types';

type Suggestion = { placeId: string; text: string };

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function usePlacesAutocomplete(initial?: LocationValue) {
  const [text, setText] = useState<string>(initial?.label ?? '');
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounced(text, 250);
  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');
  const cacheRef = useRef<Map<string, { id: string; label: string }[]>>(
    new Map()
  );
  const sessionTokenRef = useRef<string>(
    crypto?.randomUUID?.() ?? `${Date.now()}`
  );

  // keep input in sync when initial changes
  useEffect(() => {
    setText(initial?.label ?? '');
  }, [initial?.label]);

  useEffect(() => {
    const q = debounced.trim();
    setError(null);

    if (q.length < 2) {
      abortRef.current?.abort();
      setItems([]);
      setLoading(false);
      lastQueryRef.current = q;
      return;
    }

    if (q === lastQueryRef.current) {
      const cached = cacheRef.current.get(q);
      if (cached) {
        setItems(cached);
        return;
      }
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/places/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: q,
            sessionToken: sessionTokenRef.current,
            languageCode: 'pl',
            regionCodes: ['pl'],
            includedPrimaryTypes: ['locality', 'sublocality', 'route'],
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          setItems([]);
          setError(await res.text());
          return;
        }
        const data = await res.json();
        const suggestions: Suggestion[] = (data?.suggestions ?? [])
          .map((s: any) => s.placePrediction)
          .filter(Boolean)
          .map((p: any) => ({
            placeId: p.placeId || p.place,
            text: p.text?.text || '',
          }))
          .filter((x: Suggestion) => x.text && x.placeId);

        const mapped = suggestions.map(s => ({ id: s.placeId, label: s.text }));
        cacheRef.current.set(q, mapped);
        setItems(mapped);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError('Autocomplete error');
          setItems([]);
        }
      } finally {
        lastQueryRef.current = q;
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debounced]);

  async function pickById(
    id: string,
    fallbackLabel: string,
    onPick: (loc: LocationValue) => void
  ) {
    const params = new URLSearchParams({ placeId: id });
    params.set('sessionToken', sessionTokenRef.current);
    const res = await fetch(`/api/places/details?${params.toString()}`);
    if (!res.ok) return;
    const d = await res.json();
    const { id: pid, label, lat, lng, viewport } = d || {};
    if (typeof lat === 'number' && typeof lng === 'number') {
      const next: LocationValue = {
        label: label || fallbackLabel,
        placeId: pid || id,
        lat,
        lng,
        viewport,
      };
      onPick(next);
      if (crypto?.randomUUID) sessionTokenRef.current = crypto.randomUUID();
    }
  }

  function clear(onPick?: (loc: LocationValue | undefined) => void) {
    setText('');
    setItems([]);
    lastQueryRef.current = '';
    onPick?.(undefined);
  }

  return { text, setText, items, loading, error, pickById, clear };
}
