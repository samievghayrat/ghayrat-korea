'use client';

import type { CarListing } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface CarSpecsProps {
  car: CarListing;
}

export default function CarSpecs({ car }: CarSpecsProps) {
  const { t, formatMileage } = useApp();

  const yearMonth = car.month
    ? `${car.year}/${String(car.month).padStart(2, '0')} г.`
    : `${car.year} г.`;

  const specs = [
    { label: t('spec.date'), value: yearMonth },
    { label: t('spec.mileage'), value: car.mileage ? formatMileage(car.mileage) : null },
    { label: t('spec.displacement'), value: car.displacement ? `${car.displacement.toLocaleString()} см³` : null },
    { label: t('spec.power'), value: car.hp ? `${car.hp} ${t('spec.hp')}` : null },
    { label: t('spec.fuel'), value: car.fuel || null },
    { label: t('spec.trans'), value: car.transmission || null },
    { label: t('spec.body'), value: car.bodyType || null },
    { label: t('spec.color'), value: car.color || null },
    { label: t('spec.seats'), value: car.seatCount ? String(car.seatCount) : null },
    { label: 'VIN', value: car.vin || null },
  ].filter(s => s.value);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-semibold text-primary">{t('spec.generalData')}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
        {specs.map((spec) => (
          <div key={spec.label} className="min-w-0 border-b border-gray-100 pb-2">
            <div className="text-xs font-medium text-gray-400">{spec.label}</div>
            <div className="mt-0.5 text-sm font-semibold text-gray-900 break-words">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
