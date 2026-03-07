'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CarListing } from '@/types';
import FavoriteButton from '@/components/shared/FavoriteButton';
import { formatPrice, formatMileage } from '@/lib/currency';
import { calculateImportCost } from '@/lib/calculator';

interface CarCardProps {
  car: CarListing;
}

export default function CarCard({ car }: CarCardProps) {
  const handleClick = () => {
    try {
      sessionStorage.setItem(`car_${car.id}`, JSON.stringify(car));
    } catch {}
  };

  const displayModel = car.generation
    ? `${car.model} ${car.generation}`
    : car.model;

  const yearLabel = car.month
    ? `${car.year}/${String(car.month).padStart(2, '0')}`
    : `${car.year}`;

  const breakdown = calculateImportCost({
    priceKrw: car.price_krw,
    priceRub: car.price_rub,
    displacement: car.displacement || 0,
    year: car.year,
    month: car.month,
    fuel: car.fuel,
    hp: car.hp,
    destination: 'russia',
  });

  return (
    <Link href={`/catalog/${car.id}`} onClick={handleClick} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={car.imageUrl || '/images/no-image.svg'}
          alt={`${car.brand} ${car.model} ${car.year}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />

        {/* Favorite button - top right */}
        <div className="absolute top-2.5 right-2.5">
          <FavoriteButton carId={car.id} size="sm" />
        </div>

        {/* Badge - bottom left */}
        {car.source === 'own' && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              В наличии
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand & Model - main title */}
        <h3 className="font-bold text-gray-900 text-[15px] leading-tight group-hover:text-primary transition-colors">
          {car.brand} <span className="text-gray-600 font-semibold">{displayModel}</span>
        </h3>

        {/* Trim */}
        {car.trim && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{car.trim}</p>
        )}

        {/* Year · Mileage · Fuel row */}
        <div className="text-[12px] text-gray-500 mt-2">
          {yearLabel} · {formatMileage(car.mileage)} · {car.fuel}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-2" />

        {/* Price section */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-extrabold text-primary leading-tight">
                {car.price_usd ? formatPrice(car.price_usd, 'USD') : formatPrice(car.price_krw, 'KRW')}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Цена в Корее</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-bold text-gray-700">
                {formatPrice(breakdown.total, 'RUB')}
              </div>
              <div className="text-[10px] text-gray-400">под ключ до Владивостока</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
