'use client';

import type { CarFilters } from '@/types';
import { FUEL_TYPES, BODY_TYPES, TRANSMISSION_TYPES, DRIVETRAIN_TYPES, COLOR_OPTIONS, CAR_OPTIONS } from '@/lib/constants';
import { translateGenerationName } from '@/lib/translations';

interface FilterChipsProps {
  filters: CarFilters;
  onChange: (filters: CarFilters) => void;
}

export default function FilterChips({ filters, onChange }: FilterChipsProps) {
  const chips: { label: string; key: keyof CarFilters; color?: string }[] = [];

  if (filters.brand) chips.push({ label: filters.brand, key: 'brand' });
  if (filters.model) chips.push({ label: `Модель: ${filters.model}`, key: 'model' });
  if (filters.modelVariant) {
    const translated = translateGenerationName(filters.modelVariant);
    chips.push({ label: `Поколение: ${translated}`, key: 'modelVariant' });
  }
  if (filters.fuel) {
    const fuelLabel = FUEL_TYPES.find(f => f.value === filters.fuel)?.label || filters.fuel;
    chips.push({ label: fuelLabel, key: 'fuel' });
  }
  if (filters.bodyType) {
    const bodyLabel = BODY_TYPES.find(b => b.value === filters.bodyType)?.label || filters.bodyType;
    chips.push({ label: bodyLabel, key: 'bodyType' });
  }
  if (filters.transmission) {
    const transLabel = TRANSMISSION_TYPES.find(t => t.value === filters.transmission)?.label || filters.transmission;
    chips.push({ label: `КПП: ${transLabel}`, key: 'transmission' });
  }
  if (filters.drivetrain) {
    const driveLabel = DRIVETRAIN_TYPES.find(d => d.value === filters.drivetrain)?.label || filters.drivetrain;
    chips.push({ label: `Привод: ${driveLabel}`, key: 'drivetrain' });
  }
  if (filters.color) {
    const colorLabel = COLOR_OPTIONS.find(c => c.value === filters.color)?.label || filters.color;
    chips.push({ label: `Цвет: ${colorLabel}`, key: 'color' });
  }
  if (filters.yearFrom) {
    const monthStr = filters.monthFrom ? `.${String(filters.monthFrom).padStart(2, '0')}` : '';
    chips.push({ label: `от ${filters.yearFrom}${monthStr} г.`, key: 'yearFrom' });
  }
  if (filters.yearTo) {
    const monthStr = filters.monthTo ? `.${String(filters.monthTo).padStart(2, '0')}` : '';
    chips.push({ label: `до ${filters.yearTo}${monthStr} г.`, key: 'yearTo' });
  }
  if (filters.priceFrom) chips.push({ label: `от ${(filters.priceFrom * 10000).toLocaleString('ru-RU')} ₽`, key: 'priceFrom' });
  if (filters.priceTo) chips.push({ label: `до ${(filters.priceTo * 10000).toLocaleString('ru-RU')} ₽`, key: 'priceTo' });
  if (filters.mileageTo) chips.push({ label: `до ${filters.mileageTo.toLocaleString('ru-RU')} км`, key: 'mileageTo' });

  // Option chips
  const optionChips = (filters.options || []).map(code => {
    const opt = CAR_OPTIONS.find(o => o.code === code);
    return { code, label: opt?.label || code };
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
