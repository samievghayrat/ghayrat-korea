'use client';

import type { CarFilters } from '@/types';
import { translateGenerationName } from '@/lib/translations';
import { useApp } from '@/contexts/AppContext';
import type { TranslationKey } from '@/lib/i18n';

interface FilterChipsProps {
  filters: CarFilters;
  onChange: (filters: CarFilters) => void;
}

export default function FilterChips({ filters, onChange }: FilterChipsProps) {
  const { t, currency } = useApp();

  const fuelMap: Record<string, TranslationKey> = {
    gasoline: 'fuel.gasoline', diesel: 'fuel.diesel', hybrid: 'fuel.hybrid',
    electric: 'fuel.electric', lpg: 'fuel.lpg',
  };
  const bodyMap: Record<string, TranslationKey> = {
    sedan: 'body.sedan', suv: 'body.suv', hatchback: 'body.hatchback',
    wagon: 'body.wagon', coupe: 'body.coupe', convertible: 'body.convertible',
    minivan: 'body.minivan', pickup: 'body.pickup',
  };
  const transMap: Record<string, TranslationKey> = {
    auto: 'trans.auto', manual: 'trans.manual', dct: 'trans.dct', cvt: 'trans.cvt',
  };
  const driveMap: Record<string, TranslationKey> = {
    fwd: 'drive.fwd', rwd: 'drive.rwd', awd: 'drive.awd',
  };
  const colorMap: Record<string, TranslationKey> = {
    white: 'color.white', black: 'color.black', gray: 'color.gray', silver: 'color.silver',
    blue: 'color.blue', red: 'color.red', brown: 'color.brown', green: 'color.green', other: 'color.other',
  };
  const optMap: Record<string, TranslationKey> = {
    '010': 'opt.010', '014': 'opt.014', '005': 'opt.005', '058': 'opt.058',
    '087': 'opt.087', '075': 'opt.075', '007': 'opt.007', '009': 'opt.009',
    '082': 'opt.082', '023': 'opt.023', '068': 'opt.068', '079': 'opt.079',
    '057': 'opt.057', '059': 'opt.059', '088': 'opt.088', '086': 'opt.086',
    '095': 'opt.095', '091': 'opt.091',
  };

  const currencySymbol = { RUB: '₽', USD: '$', EUR: '€', KRW: '₩' }[currency];

  const chips: { label: string; key: keyof CarFilters }[] = [];

  if (filters.brand) chips.push({ label: filters.brand, key: 'brand' });
  if (filters.model) chips.push({ label: `${t('chip.model')} ${filters.model}`, key: 'model' });
  if (filters.modelVariant) {
    const translated = translateGenerationName(filters.modelVariant);
    chips.push({ label: `${t('chip.generation')} ${translated}`, key: 'modelVariant' });
  }
  if (filters.fuel) {
    const key = fuelMap[filters.fuel];
    chips.push({ label: key ? t(key) : filters.fuel, key: 'fuel' });
  }
  if (filters.bodyType) {
    const key = bodyMap[filters.bodyType];
    chips.push({ label: key ? t(key) : filters.bodyType, key: 'bodyType' });
  }
  if (filters.transmission) {
    const key = transMap[filters.transmission];
    chips.push({ label: `${t('chip.trans')} ${key ? t(key) : filters.transmission}`, key: 'transmission' });
  }
  if (filters.drivetrain) {
    const key = driveMap[filters.drivetrain];
    chips.push({ label: `${t('chip.drive')} ${key ? t(key) : filters.drivetrain}`, key: 'drivetrain' });
  }
  if (filters.color) {
    const key = colorMap[filters.color];
    chips.push({ label: `${t('chip.color')} ${key ? t(key) : filters.color}`, key: 'color' });
  }
  if (filters.yearFrom) {
    const monthStr = filters.monthFrom ? `.${String(filters.monthFrom).padStart(2, '0')}` : '';
    chips.push({ label: `${t('chip.from')} ${filters.yearFrom}${monthStr} ${t('chip.yr')}`, key: 'yearFrom' });
  }
  if (filters.yearTo) {
    const monthStr = filters.monthTo ? `.${String(filters.monthTo).padStart(2, '0')}` : '';
    chips.push({ label: `${t('chip.to')} ${filters.yearTo}${monthStr} ${t('chip.yr')}`, key: 'yearTo' });
  }
  if (filters.priceFrom) chips.push({ label: `${t('chip.from')} ${(filters.priceFrom * 10000).toLocaleString()} ${currencySymbol}`, key: 'priceFrom' });
  if (filters.priceTo) chips.push({ label: `${t('chip.to')} ${(filters.priceTo * 10000).toLocaleString()} ${currencySymbol}`, key: 'priceTo' });
  if (filters.mileageTo) chips.push({ label: `${t('chip.to')} ${filters.mileageTo.toLocaleString()} ${t('chip.km')}`, key: 'mileageTo' });

  const optionChips = (filters.options || []).map(code => {
    const key = optMap[code];
    return { code, label: key ? t(key) : code };
  });

  if (chips.length === 0 && optionChips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/15 text-primary text-xs font-medium rounded-full"
        >
          {chip.label}
          <button
            onClick={() => {
              const newFilters = { ...filters, [chip.key]: undefined, page: 1 };
              if (chip.key === 'brand') { newFilters.model = undefined; newFilters.modelVariant = undefined; }
              if (chip.key === 'model') newFilters.modelVariant = undefined;
              onChange(newFilters);
            }}
            className="hover:text-red-500 transition-colors ml-0.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      {optionChips.map((opt) => (
        <span
          key={`opt-${opt.code}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full"
        >
          {opt.label}
          <button
            onClick={() => {
              const next = (filters.options || []).filter(c => c !== opt.code);
              onChange({ ...filters, options: next.length > 0 ? next : undefined, page: 1 });
            }}
            className="hover:text-red-500 transition-colors ml-0.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
