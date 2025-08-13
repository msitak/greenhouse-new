// lib/range/useRange.ts
'use client';

import { useEffect, useState } from 'react';
import { clamp, formatNumberPL, parseHumanInt } from '@/lib/utils/range';

export type RangeValue = [number | null, number | null];

export type UseRangeOptions = {
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  onChange: (v: RangeValue) => void;
  format?: (n: number) => string;
  parse?: (s: string) => number | null;
};

export function useRange({
  min,
  max,
  step = 1,
  value,
  onChange,
  format = formatNumberPL,
  parse = parseHumanInt,
}: UseRangeOptions) {
  const [lo, hi] = value;

  // local drafts (nie zmieniamy parenta podczas pisania)
  const [minText, setMinText] = useState(lo == null ? '' : format(lo));
  const [maxText, setMaxText] = useState(hi == null ? '' : format(hi));

  // czy aktualnie edytujemy pole (żeby nie nadpisywać draftu zmianą z zewnątrz)
  const [editingMin, setEditingMin] = useState(false);
  const [editingMax, setEditingMax] = useState(false);

  // synchronizacja z parentem, ale nie kiedy użytkownik edytuje to pole
  useEffect(() => {
    if (!editingMin) setMinText(lo == null ? '' : format(lo));
  }, [lo, format, editingMin]);

  useEffect(() => {
    if (!editingMax) setMaxText(hi == null ? '' : format(hi));
  }, [hi, format, editingMax]);

  // public API
  function changeMinText(s: string) {
    if (!editingMin) setEditingMin(true);
    setMinText(s);
  }
  function changeMaxText(s: string) {
    if (!editingMax) setEditingMax(true);
    setMaxText(s);
  }

  // commit (na blur/Enter) — koryguje tylko pole, które commitujemy
  function commitMin() {
    let a = parse(minText);
    // null => brak ograniczenia min
    if (a == null) {
      onChange([null, hi ?? null]);
      setMinText('');
      setEditingMin(false);
      return;
    }
    // clamp do [min,max]
    a = clamp(a, min, max);
    // JEŚLI min > hi (jeśli hi istnieje), to NIE podnosimy hi — tylko przycinamy min do hi
    if (hi != null && a > hi) a = hi;
    onChange([a, hi ?? null]);
    setMinText(format(a));
    setEditingMin(false);
  }

  function commitMax() {
    let b = parse(maxText);
    if (b == null) {
      onChange([lo ?? null, null]);
      setMaxText('');
      setEditingMax(false);
      return;
    }
    b = clamp(b, min, max);
    // JEŚLI max < lo (jeśli lo istnieje), to NIE obniżamy lo — tylko podnosimy max do lo
    if (lo != null && b < lo) b = lo;
    onChange([lo ?? null, b]);
    setMaxText(format(b));
    setEditingMax(false);
  }

  function clear() {
    onChange([null, null]);
    setMinText('');
    setMaxText('');
    setEditingMin(false);
    setEditingMax(false);
  }

  // strzałki (↑/↓), Shift = x10; commit od razu
  function bumpMin(deltaSteps: number) {
    const current = lo ?? min;
    const next = clamp(current + deltaSteps * step, min, hi ?? max);
    onChange([next, hi ?? null]);
    setMinText(format(next));
  }
  function bumpMax(deltaSteps: number) {
    const current = hi ?? max;
    const next = clamp(current + deltaSteps * step, lo ?? min, max);
    onChange([lo ?? null, next]);
    setMaxText(format(next));
  }

  return {
    lo,
    hi,
    minText,
    maxText,
    changeMinText,
    changeMaxText,
    commitMin,
    commitMax,
    clear,
    bumpMin,
    bumpMax,
    format,
  };
}
