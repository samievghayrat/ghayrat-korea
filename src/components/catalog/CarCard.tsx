'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CarListing } from '@/types';
import FavoriteButton from '@/components/shared/FavoriteButton';
import { useApp } from '@/contexts/AppContext';

interface CarCardProps {
  car: CarListing;
  priority?: boolean;
}

export default function CarCard({ car, priority = false }: CarCardProps) {
  const { t, formatPrice, formatKrwPrice, formatMileage } = useApp();

  const handleClick = () => {
    try {
      sessionStorage.setItem(`car_${car.id}`, JSON.stringify(car));
    } catch {}
  };

  const displayModel = car.generation && !car.generation.toLowerCase().startsWith(car.model.toLowerCase())
    ? `${car.model} ${car.generation}`
    : car.model;

  const yearLabel = car.month
    ? `${car.year}/${String(car.month).padStart(2, '0')}`
    : `${car.year}`;

  return (
    <Link
      href={`/catalog/${car.id}`}
      onClick={handleClick}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col shadow-sm"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={car.imageUrl || '/images/no-image.svg'}
          alt={`${car.brand} ${car.model} ${car.year}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />
        <div className="absolute top-2.5 right-2.5">
          <FavoriteButton carId={car.id} size="sm" />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {car.source === 'own' && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              {t('card.inStock')}
            </span>
          )}
          {car.reservationStatus === 'reserved' && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              {t('card.reserved')}
            </span>
          )}
          {car.reservationStatus === 'sold' && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              {t('card.sold')}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-950 text-[15px] leading-tight group-hover:text-primary transition-colors">
          {car.brand} <span className="text-gray-600 font-semibold">{displayModel}</span>
        </h3>
        {(car.badge || car.trim) && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{car.badge || car.trim}</p>
        )}
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-lg bg-gray-50 px-1.5 py-2">
            <div className="text-[10px] text-gray-400 leading-none">Year</div>
            <div className="mt-1 text-[11px] font-semibold text-gray-800">{yearLabel}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-1.5 py-2">
            <div className="text-[10px] text-gray-400 leading-none">Km</div>
            <div className="mt-1 text-[11px] font-semibold text-gray-800 truncate">{formatMileage(car.mileage)}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-1.5 py-2">
            <div className="text-[10px] text-gray-400 leading-none">Fuel</div>
            <div className="mt-1 text-[11px] font-semibold text-gray-800 truncate">{car.fuel}</div>
          </div>
        </div>
        <div className="flex-1 min-h-2" />
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {car.price_turnkey_russia && (
            <div>
              <div className="text-lg font-extrabold text-gray-950 leading-tight">
                {formatPrice(car.price_turnkey_russia)}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{t('card.turnkeyVladivostok')}</div>
            </div>
          )}
          <div className={car.price_turnkey_russia ? 'flex items-center justify-between text-xs' : ''}>
            <span className="text-gray-400">{t('card.priceInKorea')}</span>
            <span className="font-bold text-primary">{formatKrwPrice(car.price_krw)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
