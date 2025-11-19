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
import { ChevronDownIcon, X } from 'lucide-react';

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

  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      setTriggerWidth(inputRef.current.offsetWidth);
    }
  }, [open]); // Re-measure on open

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
              className={cn(
                'h-12 text-base w-full pr-10 bg-[#F7F7F7] text-[#6E6E6E] lg:bg-white lg:text-inherit transition-all',
                inputClassName,
                open && 'rounded-b-none border-b-0'
              )}
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
            <div className='absolute inset-y-0 right-2 my-auto flex items-center'>
              {value ? (
                <button
                  type='button'
                  aria-label='Wyczyść'
                  className='h-7 w-7 grid place-items-center rounded hover:bg-muted mr-1'
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
              <ChevronDownIcon className='size-4 text-black lg:hidden' />
            </div>
          </div>
        </PopoverTrigger>

        {/* Pokazujemy menu tylko, gdy są wyniki */}
        <PopoverContent
          className={cn(
            'p-0 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-x-hidden overflow-y-auto bg-white text-black shadow-xs',
            // Mobile: squared top (no radius), rounded bottom, no border
            'rounded-none rounded-b-2xl border-0',
            // Desktop: standard rounded border
            'md:rounded-2xl md:border md:border-[#F0F0F0]'
          )}
          style={{
            width:
              typeof menuWidth === 'number' || typeof menuWidth === 'string'
                ? `${menuWidth}px`
                : triggerWidth
                  ? `${triggerWidth}px`
                  : undefined,
          }}
          align='start'
          sideOffset={0}
          avoidCollisions={false}
          onOpenAutoFocus={e => {
            e.preventDefault();
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <Command shouldFilter={false} className='bg-white text-[#111]'>
            <CommandGroup id='ac-items' className='p-0'>
              {items.map((it, idx) => (
                <CommandItem
                  key={it.id}
                  value={it.label}
                  onSelect={() => handleSelect(it)}
                  className={cn(
                    'relative flex w-full cursor-default items-center gap-2 py-3 pr-8 pl-4 text-sm/[20px] leading-[28px] outline-hidden select-none text-[#111] data-[selected]:bg-[#F4F4F4] data-[selected]:text-[#111]',
                    idx === activeIndex ? 'bg-[#F4F4F4]' : undefined
                  )}
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
