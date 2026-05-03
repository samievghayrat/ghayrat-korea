'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CarListing } from '@/types';
import FavoriteButton from '@/components/shared/FavoriteButton';
import { useApp } from '@/contexts/AppContext';
import { translateBadgeDetail } from '@/lib/translations';

interface CarCardProps {
  car: CarListing;
  priority?: boolean;
  destination?: 'russia' | 'tajikistan';
}

export default function CarCard({ car, priority = false, destination = 'russia' }: CarCardProps) {
  const { t, formatPrice, formatKrwPrice, formatMileage } = useApp();

  const handleClick = () => {
    try {
      sessionStorage.setItem(`car_${car.id}`, JSON.stringify(car));
    } catch {}
  };

  const displayModel = car.generation && !car.generation.toLowerCase().startsWith(car.model.toLowerCase())
    ? `${car.model} ${car.generation}`
    : car.model;
  const displayTrim = translateBadgeDetail(car.badge || car.trim || '');

  const yearLabel = car.month
    ? `${car.year}/${String(car.month).padStart(2, '0')}`
    : `${car.year}`;
  const turnkeyPrice = destination === 'russia'
    ? car.price_turnkey_russia
    : car.price_turnkey_tajikistan;
  const turnkeyLabel = destination === 'russia'
    ? 'под ключ до Владивостока'
    : t('card.turnkeyTajikistan');
  const formattedTurnkeyPrice = destination === 'russia'
    ? turnkeyPrice ? formatPrice(turnkeyPrice) : ''
    : turnkeyPrice ? `$${turnkeyPrice.toLocaleString('en-US')}` : '';

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

      <div className="flex flex-1 flex-col p-3.5">
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
          <span className="truncate">{car.fuel}</span>
        </div>

        <div className="mt-3 rounded-md bg-emerald-50/70 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[11px] font-semibold text-emerald-700/75">{t('card.priceInKorea')}</div>
            <div className="shrink-0 text-xl font-extrabold leading-tight text-emerald-700">
              {formatKrwPrice(car.price_krw)}
            </div>
          </div>
          {turnkeyPrice && (
            <div className="mt-1.5 border-t border-emerald-100 pt-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[10px] font-medium leading-snug text-gray-500">{turnkeyLabel}</div>
                <div className="shrink-0 text-sm font-bold leading-tight text-gray-900">
                  {formattedTurnkeyPrice}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
