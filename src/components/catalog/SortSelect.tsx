'use client';

import { useApp } from '@/contexts/AppContext';
import type { TranslationKey } from '@/lib/i18n';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const sortKeys: { value: string; key: TranslationKey }[] = [
  { value: 'price_asc', key: 'sort.priceAsc' },
  { value: 'price_desc', key: 'sort.priceDesc' },
  { value: 'year_desc', key: 'sort.yearDesc' },
  { value: 'year_asc', key: 'sort.yearAsc' },
  { value: 'mileage_asc', key: 'sort.mileageAsc' },
  { value: 'mileage_desc', key: 'sort.mileageDesc' },
];

export default function SortSelect({ value, onChange }: SortSelectProps) {
  const { t } = useApp();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
    >
      {sortKeys.map((opt) => (
        <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
      ))}
    </select>
  );
}
