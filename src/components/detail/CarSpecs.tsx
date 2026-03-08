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

  // Full car name: Brand Model Generation Trim
  const fullName = [car.brand, car.model, car.generation, car.trim].filter(Boolean).join(' ');

  const specs = [
    { label: t('spec.date'), value: yearMonth },
    { label: t('spec.mileage'), value: car.mileage ? formatMileage(car.mileage) : null },
    { label: t('spec.displacement'), value: car.displacement ? `${car.displacement.toLocaleString()} cc` : null },
    { label: t('spec.power'), value: car.hp ? `${car.hp} ${t('spec.hp')}` : null },
    { label: t('spec.fuel'), value: car.fuel || null },
    { label: t('spec.trans'), value: car.transmission || null },
    { label: t('spec.body'), value: car.bodyType || null },
    { label: t('spec.color'), value: car.color || null },
    { label: t('spec.seats'), value: car.seatCount ? String(car.seatCount) : null },
    { label: 'VIN', value: car.vin || null },
  ].filter(s => s.value);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{fullName}</h2>
      <p className="text-sm text-gray-400 mb-5">{t('spec.generalData')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-baseline gap-1">
            <span className="text-gray-400 text-sm whitespace-nowrap">{spec.label}</span>
            <span className="flex-1 border-b border-dotted border-gray-200 min-w-[2rem]" />
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
