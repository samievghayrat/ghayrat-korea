'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CarListing } from '@/types';
import FavoriteButton from '@/components/shared/FavoriteButton';
import { useApp } from '@/contexts/AppContext';
import { getFullCarName } from '@/lib/translations';
import { localizeVehicleValue } from '@/lib/i18n';
import { getPriceIncludingEncarFee } from '@/lib/encar-fee';
import { getCarDeliveryDestination } from '@/lib/car-destination';

interface CarCardProps {
  car: CarListing;
  priority?: boolean;
}

export default function CarCard({ car, priority = false }: CarCardProps) {
  const { t, lang, formatListingPrice, formatMileage } = useApp();

  const handleClick = () => {
    try {
      sessionStorage.setItem(`car_${car.id}`, JSON.stringify(car));
    } catch {}
  };

  const displayTitle = getFullCarName(car, lang);

  const yearLabel = car.month
    ? `${car.year}/${String(car.month).padStart(2, '0')}`
    : `${car.year}`;
  const usesDirectEncarImage = car.imageUrl?.startsWith('https://ci.encar.com');
  const hasPrice = car.price_krw > 0 || (car.source === 'own' && (car.price_rub > 0 || (car.price_usd || 0) > 0));
  const displayPrice = getPriceIncludingEncarFee(car,
    car.source === 'encar' ? getCarDeliveryDestination(car.year) : undefined);
  const fuelValue = car.fuel.toLocaleLowerCase();
  const drivetrainValue = (car.drivetrain || '').toLocaleLowerCase();
  const highlights = [
    car.mileage > 0 && car.mileage <= 50_000 ? t('card.lowMileage') : null,
    /hybrid|гибрид|하이브리드/.test(fuelValue) ? t('fuel.hybrid')
      : /electric|электро|전기/.test(fuelValue) ? t('fuel.electric') : null,
    /awd|4wd|полный|사륜|4륜/.test(drivetrainValue) ? t('card.allWheelDrive') : null,
  ].filter((value): value is string => Boolean(value)).slice(0, 2);

  return (
    <Link
      href={car.source === 'own' ? `/our-cars/${car.id}` : `/catalog/${car.id}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={car.imageUrl || '/images/no-image.svg'}
          alt={`${displayTitle} ${car.year}`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          fetchPriority={priority ? 'high' : 'auto'}
          unoptimized={usesDirectEncarImage || car.source === 'own'}
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
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 data-testid="car-full-title" className="break-words text-[15px] font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary">
              {displayTitle}
            </h3>

            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-gray-600">
              <span>{yearLabel}</span>
              <span className="text-gray-300">/</span>
              <span>{formatMileage(car.mileage)}</span>
              <span className="text-gray-300">/</span>
              <span className="truncate">{localizeVehicleValue(car.fuel, lang)}</span>
            </div>
            {highlights.length > 0 && (
              <div data-testid="car-highlights" className="mt-2 flex flex-wrap gap-1.5">
                {highlights.map(highlight => (
                  <span key={highlight} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                    {highlight}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right text-base font-extrabold leading-tight text-emerald-700 sm:text-lg">
            {hasPrice ? formatListingPrice(displayPrice.priceKrw, displayPrice.priceRub, displayPrice.priceUsd) : '—'}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm font-semibold text-gray-700 transition-colors group-hover:text-primary">
          <span>{t(car.source === 'own' ? 'card.viewCar' : 'card.viewAndCalculate')}</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
