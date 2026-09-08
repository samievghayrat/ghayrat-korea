'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CarListing } from '@/types';
import FavoriteButton from '@/components/shared/FavoriteButton';
import { useApp } from '@/contexts/AppContext';
import { translateBadgeDetail, translateGenerationName } from '@/lib/translations';
import { localizeVehicleValue } from '@/lib/i18n';

interface CarCardProps {
  car: CarListing;
  priority?: boolean;
}

export default function CarCard({ car, priority = false }: CarCardProps) {
  const { t, lang, formatKrwPrice, formatMileage } = useApp();

  const handleClick = () => {
    try {
      sessionStorage.setItem(`car_${car.id}`, JSON.stringify(car));
    } catch {}
  };

  const localizedModel = translateGenerationName(car.model, lang);
  const localizedGeneration = car.generation ? translateGenerationName(car.generation, lang) : undefined;
  const displayModel = localizedGeneration && !localizedGeneration.toLowerCase().startsWith(localizedModel.toLowerCase())
    ? `${localizedModel} ${localizedGeneration}`
    : localizedModel;
  const displayTrim = translateBadgeDetail(car.badge || car.trim || '', lang);

  const yearLabel = car.month
    ? `${car.year}/${String(car.month).padStart(2, '0')}`
    : `${car.year}`;
  const usesDirectEncarImage = car.imageUrl?.startsWith('https://ci.encar.com');
  const hasPrice = car.price_krw > 0;

  return (
    <Link
      href={`/catalog/${car.id}`}
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={car.imageUrl || '/images/no-image.svg'}
          alt={`${car.brand} ${car.model} ${car.year}`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          unoptimized={usesDirectEncarImage}
        />
        <div className="absolute top-2 right-2">
          <FavoriteButton carId={car.id} size="sm" />
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          {car.source === 'own' && (
            <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {t('card.inStock')}
            </span>
          )}
          {car.reservationStatus === 'reserved' && (
            <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {t('card.reserved')}
            </span>
          )}
          {car.reservationStatus === 'sold' && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {t('card.sold')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary">
          {car.brand} <span className="font-semibold text-gray-700">{displayModel}</span>
          {displayTrim && (
            <span className="font-medium text-gray-500"> {displayTrim}</span>
          )}
        </h3>

        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-gray-600">
          <span>{yearLabel}</span>
          <span className="text-gray-300">/</span>
          <span>{formatMileage(car.mileage)}</span>
          <span className="text-gray-300">/</span>
          <span className="truncate">{localizeVehicleValue(car.fuel, lang)}</span>
        </div>

        <div className="mt-2.5 rounded-md bg-emerald-50/70 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[11px] font-semibold text-emerald-700/75">{t('card.priceInKorea')}</div>
            <div className="shrink-0 text-lg font-extrabold leading-tight text-emerald-700">
              {hasPrice ? formatKrwPrice(car.price_krw) : '—'}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm font-semibold text-gray-700 transition-colors group-hover:text-primary">
          <span>{t('card.viewAndCalculate')}</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
