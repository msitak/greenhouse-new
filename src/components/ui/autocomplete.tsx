'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { X } from 'lucide-react';

export type AutocompleteItem = { id: string; label: string };

type Props<T extends AutocompleteItem> = {
  value: string;
  onValueChange: (v: string) => void;
  items: T[];
  onSelect: (item: T) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  menuWidth?: number | string; // default 520
  renderItem?: (item: T, active: boolean) => React.ReactNode;

  /** Jeśli true: gdy zamykasz dropdown / tracisz focus bez wyboru – czyścimy input. */
  clearOnCloseIfNoSelection?: boolean;
};

export function Autocomplete<T extends AutocompleteItem>({
  value,
  onValueChange,
  items,
  onSelect,
  placeholder = 'Type…',
  className,
  inputClassName,
  menuWidth,
  renderItem,
  clearOnCloseIfNoSelection = true,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [manualClose, setManualClose] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // flaga: czy w obecnym „otwarciu” dokonano selekcji
  const selectionMadeRef = useRef(false);

  useEffect(() => {
    setActiveIndex(items.length ? 0 : -1);
    setOpen(items.length > 0 && !manualClose);
  }, [items, manualClose]);

  // Do NOT auto-open on programmatic value changes (e.g., after selecting an item).
  // We will only clear manualClose when the user types.

  function handleSelect(it: T) {
    selectionMadeRef.current = true; // zaznaczamy wybór zanim menu się zamknie
    onSelect(it);
    // Close popover after selection
    setOpen(false);
    setManualClose(true);
  }

  function handleBlur() {
    // jeśli dropdown nie jest otwarty i nic nie wybrano – czyścimy wpisany tekst
    if (
      !open &&
      clearOnCloseIfNoSelection &&
      !selectionMadeRef.current &&
      value.trim() !== ''
    ) {
      onValueChange('');
    }
    // reset flagi (nowa interakcja zacznie od false)
    selectionMadeRef.current = false;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(items[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setManualClose(true);
    }
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Popover
        open={open}
        onOpenChange={v => {
          if (!v) {
            // zamykanie: jeśli użytkownik nic nie wybrał, czyścimy
            if (
              clearOnCloseIfNoSelection &&
              !selectionMadeRef.current &&
              value.trim() !== ''
            ) {
              onValueChange('');
            }
            setOpen(false);
            setManualClose(true);
            selectionMadeRef.current = false; // reset
          } else {
            setOpen(items.length > 0);
            setManualClose(false);
            selectionMadeRef.current = false; // nowa próba wyboru
          }
        }}
      >
        <PopoverTrigger asChild>
          <div className='relative'>
            <Input
              ref={inputRef}
              className={cn('h-12 text-base w-full pr-10', inputClassName)}
              placeholder={placeholder}
              value={value}
              onChange={e => {
                // User is typing — allow menu to open on new results
                setManualClose(false);
                onValueChange(e.target.value);
              }}
              onKeyDown={onKeyDown}
              onBlur={handleBlur}
              autoComplete='off'
              aria-autocomplete='list'
              aria-expanded={open}
              aria-controls='ac-items'
            />
            {value ? (
              <button
                type='button'
                aria-label='Wyczyść'
                className='absolute inset-y-0 right-2 my-auto h-7 w-7 grid place-items-center rounded hover:bg-muted'
                onMouseDown={e => e.preventDefault()} // nie bluruj inputu
                onClick={() => {
                  onValueChange('');
                  setOpen(false);
                  setManualClose(false);
                  selectionMadeRef.current = false;
                  inputRef.current?.focus({ preventScroll: true });
                }}
              >
                <X className='h-4 w-4' />
              </button>
            ) : null}
          </div>
        </PopoverTrigger>

        {/* Pokazujemy menu tylko, gdy są wyniki */}
        <PopoverContent
          className='p-0'
          style={{
            width: typeof menuWidth === 'number' ? `${menuWidth}px` : menuWidth,
          }}
          align='start'
          collisionPadding={8}
          avoidCollisions
          onOpenAutoFocus={e => {
            e.preventDefault();
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <Command shouldFilter={false}>
            <CommandGroup id='ac-items'>
              {items.map((it, idx) => (
                <CommandItem
                  key={it.id}
                  value={it.label}
                  onSelect={() => handleSelect(it)}
                  className={idx === activeIndex ? 'bg-muted' : undefined}
                >
                  {renderItem ? renderItem(it, idx === activeIndex) : it.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
