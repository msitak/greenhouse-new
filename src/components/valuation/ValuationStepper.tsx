'use client';

import * as React from 'react';
import type { LocationValue } from '@/lib/location/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddressInput } from '@/components/valuation/AddressInput';
import { Checkbox } from '../ui/checkbox';

export type ValuationFormData = {
  address?: string;
  area?: number | null;
  rooms?: number | null;
  year?: number | null;
  standard?: 'niski' | 'średni' | 'wysoki' | '';
  // Step 3
  phone?: string;
  email?: string;
  hasBasement?: boolean;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  reason?: 'curiosity' | 'agent' | 'sell' | '';
};

export function ValuationStepper({
  onSubmit,
  className,
  consent,
  onConsentChange,
}: {
  onSubmit?: (data: ValuationFormData) => Promise<void> | void;
  className?: string;
  consent?: boolean;
  onConsentChange?: (v: boolean) => void;
}) {
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<ValuationFormData>({
    address: undefined,
    area: null,
    rooms: null,
    year: null,
    standard: '',
    phone: '',
    email: '',
    hasBasement: false,
    hasElevator: false,
    hasParking: false,
    hasBalcony: false,
    reason: '',
  });

  // Keep a display string for area to allow commas (e.g., 45,7)
  const [areaText, setAreaText] = React.useState<string>('');

  // Validation error messages per step
  const [step2Errors, setStep2Errors] = React.useState<{
    rooms?: string;
    year?: string;
    standard?: string;
  }>({});
  const [step3Errors, setStep3Errors] = React.useState<{
    phone?: string;
    email?: string;
    reason?: string;
  }>({});

  React.useEffect(() => {
    setAreaText(form.area != null ? String(form.area).replace('.', ',') : '');
  }, [form.area]);

  // Validation: step 1 requires selected address AND marketing consent
  // Step 3 requires contact + reason (Informacje o mieszkaniu are optional)
  // Enablement: button active when fields are filled (no deep validation here)
  const isStep2Filled = React.useMemo(() => {
    if (step !== 2) return true;
    const roomsFilled = form.rooms != null && String(form.rooms).length > 0;
    const yearFilled = form.year != null && String(form.year).length > 0;
    const standardFilled = !!form.standard;
    return roomsFilled && yearFilled && standardFilled;
  }, [step, form.rooms, form.year, form.standard]);

  const isStep3Filled = React.useMemo(() => {
    if (step !== 3) return true;
    const phoneFilled = !!(form.phone && form.phone.trim());
    const emailFilled = !!(form.email && form.email.trim());
    const reasonFilled = !!form.reason;
    return phoneFilled && emailFilled && reasonFilled;
  }, [step, form.phone, form.email, form.reason]);

  const canNext =
    step === 1
      ? !!form.address && !!consent
      : step === 2
        ? isStep2Filled
        : step === 3
          ? isStep3Filled
          : true;

  function validateStep2(): boolean {
    const errors: { rooms?: string; year?: string; standard?: string } = {};
    if (form.rooms == null || !Number.isFinite(form.rooms)) {
      errors.rooms = 'Podaj liczbę pokoi';
    }
    if (form.year == null || !Number.isFinite(form.year)) {
      errors.year = 'Podaj rok budowy';
    }
    if (
      !form.standard ||
      !['niski', 'średni', 'wysoki'].includes(form.standard)
    ) {
      errors.standard = 'Wybierz standard';
    }
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  }

  // Accepts: 123456789, 123 456 789, 123-456-789, +48 123 456 789, 0048 123 456 789
  function isValidPolishPhone(input: string): boolean {
    const normalized = input.replace(/[\s-]/g, '');
    return /^(?:\+?48|0048)?\d{9}$/.test(normalized);
  }

  function validateStep3(): boolean {
    const errors: { phone?: string; email?: string; reason?: string } = {};
    if (!form.phone || !form.phone.trim()) {
      errors.phone = 'Podaj numer telefonu';
    } else if (!isValidPolishPhone(form.phone.trim())) {
      errors.phone = 'Podaj poprawny numer telefonu';
    }
    if (!form.email || !/.+@.+\..+/.test(form.email))
      errors.email = 'Podaj poprawny adres e‑mail';
    if (
      !(
        form.reason === 'curiosity' ||
        form.reason === 'agent' ||
        form.reason === 'sell'
      )
    ) {
      errors.reason = 'Wybierz powód';
    }
    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  }
  const isLast = step === 3;

  const next = async () => {
    if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    if (!validateStep3()) return;
    // Submit
    try {
      setSubmitting(true);
      await onSubmit?.(form);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100; // simple visual indicator

  return (
    <div className={className}>
      {/* Step content */}
      {step === 1 ? (
        <div className='space-y-6'>
          <AddressInput
            value={
              form.address ? { formattedAddress: form.address } : undefined
            }
            onChange={v =>
              setForm(prev => ({ ...prev, address: v?.formattedAddress }))
            }
          />
        </div>
      ) : step === 2 ? (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1'>
              <Label className='font-bold text-[12px]/[20px] text-black'>
                Metraż
              </Label>
              <Input
                value={areaText}
                onChange={e => {
                  const t = e.target.value;
                  setAreaText(t);
                  const normalized = t.replace(',', '.');
                  const num =
                    normalized.trim() === '' ? null : Number(normalized);
                  setForm(p => ({
                    ...p,
                    area: Number.isFinite(num as number)
                      ? (num as number)
                      : null,
                  }));
                }}
                placeholder='Wypełnij'
                className='text-sm h-10 bg-white border border-[#CCCCCC] rounded-lg px-4 text-[#6E6E6E] font-medium'
                inputMode='decimal'
              />
              {/* Placeholder to keep row height stable when errors appear on the sibling column */}
              <p className='mt-1 h-4 text-xs text-transparent'>\u00A0</p>
            </div>
            <div className='grid gap-1'>
              <Label className='font-bold text-[12px]/[20px] text-black'>
                Liczba pokoi
              </Label>
              <Input
                value={form.rooms ?? ''}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    rooms: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder='Wypełnij'
                className='text-sm h-10 bg-white border border-[#CCCCCC] rounded-lg px-4 text-[#6E6E6E] font-medium'
                inputMode='numeric'
              />
              <p
                className={`mt-1 h-4 text-xs ${
                  step === 2 && step2Errors.rooms
                    ? 'text-red-600'
                    : 'text-transparent'
                }`}
              >
                {step === 2 && step2Errors.rooms ? step2Errors.rooms : '\u00A0'}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1'>
              <Label className='font-bold text-[12px]/[20px] text-black'>
                Rok budowy
              </Label>
              <Input
                value={form.year ?? ''}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    year: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                placeholder='Wypełnij'
                className='text-sm h-10 bg-white border border-[#CCCCCC] rounded-lg px-4 text-[#6E6E6E] font-medium'
                inputMode='numeric'
              />
              <p
                className={`mt-1 h-4 text-xs ${
                  step === 2 && step2Errors.year
                    ? 'text-red-600'
                    : 'text-transparent'
                }`}
              >
                {step === 2 && step2Errors.year ? step2Errors.year : '\u00A0'}
              </p>
            </div>
            <div className='grid gap-1'>
              <Label className='font-bold text-[12px]/[20px] text-black'>
                Standard
              </Label>
              <Select
                value={form.standard ?? ''}
                onValueChange={v =>
                  setForm(p => ({
                    ...p,
                    standard: (v as ValuationFormData['standard']) || '',
                  }))
                }
              >
                <SelectTrigger className='h-10 rounded-lg bg-white border border-[#CCCCCC] text-[#6E6E6E] font-medium w-full px-4 text-sm'>
                  <SelectValue placeholder='Wybierz' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='niski'>Niski</SelectItem>
                  <SelectItem value='średni'>Średni</SelectItem>
                  <SelectItem value='wysoki'>Wysoki</SelectItem>
                </SelectContent>
              </Select>
              <p
                className={`mt-1 h-4 text-xs ${
                  step === 2 && step2Errors.standard
                    ? 'text-red-600'
                    : 'text-transparent'
                }`}
              >
                {step === 2 && step2Errors.standard
                  ? step2Errors.standard
                  : '\u00A0'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1'>
              <Label className='font-bold text-[12px]/[20px] text-black'>
                Numer telefonu
              </Label>
              <Input
                placeholder='+48'
                value={form.phone ?? ''}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className='text-sm h-10'
                inputMode='tel'
              />
              <p
                className={`mt-1 h-4 text-xs ${
                  step === 3 && step3Errors.phone
                    ? 'text-red-600'
                    : 'text-transparent'
                }`}
              >
                {step === 3 && step3Errors.phone ? step3Errors.phone : '\u00A0'}
              </p>
            </div>
            <div className='grid gap-1'>
              <Label className='font-bold text-[12px]/[20px] text-black'>
                Adres e‑mail
              </Label>
              <Input
                placeholder='Wypełnij'
                value={form.email ?? ''}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className='text-sm h-10'
                inputMode='email'
              />
              <p
                className={`mt-1 h-4 text-xs ${
                  step === 3 && step3Errors.email
                    ? 'text-red-600'
                    : 'text-transparent'
                }`}
              >
                {step === 3 && step3Errors.email ? step3Errors.email : '\u00A0'}
              </p>
            </div>
          </div>

          <div>
            <Label className='font-bold text-[12px]/[20px] text-black'>
              Informacje o mieszkaniu
            </Label>
            <div className='mt-2 grid grid-cols-2 gap-2 text-[13px] text-[#212121]'>
              <label className='inline-flex items-center gap-2'>
                <Checkbox
                  checked={!!form.hasBasement}
                  onCheckedChange={v =>
                    setForm(p => ({ ...p, hasBasement: !!v }))
                  }
                />
                Piwnica/komórka
              </label>
              <label className='inline-flex items-center gap-2'>
                <Checkbox
                  checked={!!form.hasParking}
                  onCheckedChange={v =>
                    setForm(p => ({ ...p, hasParking: !!v }))
                  }
                />
                Miejsce postojowe
              </label>
              <label className='inline-flex items-center gap-2'>
                <Checkbox
                  checked={!!form.hasElevator}
                  onCheckedChange={v =>
                    setForm(p => ({ ...p, hasElevator: !!v }))
                  }
                />
                Winda
              </label>
              <label className='inline-flex items-center gap-2'>
                <Checkbox
                  checked={!!form.hasBalcony}
                  onCheckedChange={v =>
                    setForm(p => ({ ...p, hasBalcony: !!v }))
                  }
                />
                Balkon
              </label>
            </div>
          </div>

          <div>
            <Label className='font-bold text-[12px]/[20px] text-black'>
              Z jakiego powodu sprawdzasz wycenę?
            </Label>
            <div className='mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[13px] text-[#212121]'>
              <label className='inline-flex items-center gap-2'>
                <input
                  type='radio'
                  name='reason'
                  checked={form.reason === 'curiosity'}
                  onChange={() => setForm(p => ({ ...p, reason: 'curiosity' }))}
                />
                <span className='md:hidden'>Ciekawość</span>
                <span className='hidden md:inline'>Sprawdzam z ciekawości</span>
              </label>
              <label className='inline-flex items-center gap-2'>
                <input
                  type='radio'
                  name='reason'
                  checked={form.reason === 'agent'}
                  onChange={() => setForm(p => ({ ...p, reason: 'agent' }))}
                />
                <span className='md:hidden'>Jestem agentem</span>
                <span className='hidden md:inline'>
                  Jestem agentem nieruchomości
                </span>
              </label>
              <label className='inline-flex items-center gap-2'>
                <input
                  type='radio'
                  name='reason'
                  checked={form.reason === 'sell'}
                  onChange={() => setForm(p => ({ ...p, reason: 'sell' }))}
                />
                <span className='md:hidden'>Potencjalna sprzedaż</span>
                <span className='hidden md:inline'>Chciałbym sprzedać</span>
              </label>
              <p
                className={`col-span-2 mt-1 h-4 text-xs ${
                  step === 3 && step3Errors.reason
                    ? 'text-red-600'
                    : 'text-transparent'
                }`}
              >
                {step === 3 && step3Errors.reason
                  ? step3Errors.reason
                  : '\u00A0'}
              </p>
            </div>
          </div>

          {/* Kontakt – usunięte, zgoda marketingowa jest zbierana w kroku 1 */}
        </div>
      )}

      {/* Actions */}
      <div className='mt-6'>
        <Button
          type='button'
          className='w-full h-12 text-[14px]/[20px] font-medium'
          onClick={next}
          disabled={!canNext || submitting}
        >
          {isLast
            ? submitting
              ? 'Wysyłanie…'
              : 'Wygeneruj raport'
            : step === 2
              ? 'Dalej'
              : 'Otrzymaj darmową wycenę'}
        </Button>
        {step === 1 && onConsentChange ? (
          <div className='mt-3 flex items-start gap-2'>
            <Checkbox
              id='marketing-consent'
              checked={!!consent}
              onCheckedChange={v => onConsentChange(!!v)}
              className='mt-0.5'
            />
            <label
              htmlFor='marketing-consent'
              className='text-[#6F6F6F] text-[12px]/[18px]'
            >
              Przechodząc dalej wyrażam zgodę na przekazanie zgody
              marketingowej.
            </label>
          </div>
        ) : null}
        {/* progress - hidden on step 1 */}
        {step > 1 ? (
          <div className='mt-6 flex gap-2'>
            <div className='h-2 flex-1 rounded-full bg-[#4FA200]' />
            <div
              className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#4FA200]' : 'bg-[#FFC107]'}`}
            />
            <div
              className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#FFC107]' : 'bg-[#EAEAEA]'}`}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
