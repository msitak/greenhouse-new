'use client';

import { useEffect, useRef, useState } from 'react';
import type { LocationValue } from '@/lib/location/types';

type Suggestion = { placeId: string; text: string; mainText?: string; secondaryText?: string; types?: string[] };
const DEBOUNCE_MS = 500; // reduce API calls cost

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

  const debounced = useDebounced(text, DEBOUNCE_MS);
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

    // Require at least 3 chars to query
    if (q.length < 3) {
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
            // Restrict to cities only
            includedPrimaryTypes: ['locality'],
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
            // Prefer structured label pieces
            text: p.text?.text || '',
            mainText: p.structuredFormat?.mainText?.text || '',
            secondaryText: p.structuredFormat?.secondaryText?.text || '',
            types: p.types || [],
          }))
          .filter((x: Suggestion) => x.text && x.placeId);

        // Remove trailing country since we only operate in Poland
        const stripCountry = (label: string) =>
          label.replace(/,\s*(polska|poland|pl)$/i, '').trim();

        // Build friendly label depending on type:
        // - route: show "Street, District, City" when possible
        // - sublocality: show "District, City"
        // - locality: show "City" only
        const buildLabel = (s: Suggestion) => {
          const main = (s.mainText || s.text).split(',')[0].trim();
          const sec = s.secondaryText || '';
          const isRoute = (s.types || []).includes('route');
          const isSublocality = (s.types || []).includes('sublocality');
          const isLocality = (s.types || []).includes('locality');
          if (isLocality) return stripCountry(main);
          if (isSublocality) return stripCountry(`${main}${sec ? `, ${sec}` : ''}`);
          if (isRoute) return stripCountry(`${main}${sec ? `, ${sec}` : ''}`);
          return stripCountry(`${main}${sec ? `, ${sec}` : ''}`);
        };

        const mappedRaw = suggestions.map(s => ({ id: s.placeId, label: buildLabel(s) }));

        // Filter so that main label (before comma) matches input (diacritics-insensitive)
        const normalize = (str: string) =>
          str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const nq = normalize(q);
        // Token-based match across the whole label (supports "city district" or "district city")
        const tokens = nq
          .split(/\s+/)
          .map(t => t.trim())
          .filter(Boolean);

        const mappedFiltered = mappedRaw.filter(it => {
          const nmFull = normalize(it.label.replace(/,/g, ' '));
          return tokens.every(t => nmFull.includes(t));
        });

        const preferCity = 'czestochowa';
        const itemsBase = mappedFiltered.length ? mappedFiltered : mappedRaw;
        const scored = itemsBase
          .map(it => {
            const n = normalize(it.label);
            const score = (n.includes(preferCity) ? 10 : 0) + tokens.reduce((acc, t) => acc + (n.includes(t) ? 1 : 0), 0);
            return { it, score };
          })
          .sort((a, b) => b.score - a.score)
          .map(x => x.it);

        const finalItems = scored;
        cacheRef.current.set(q, finalItems);
        setItems(finalItems);
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
