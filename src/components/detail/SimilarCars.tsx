'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CarListing } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface SimilarCarsProps {
  brand: string;
  model: string;
  excludeId: string;
  priceRub: number;
}

export default function SimilarCars({ brand, model, excludeId, priceRub }: SimilarCarsProps) {
  const [cars, setCars] = useState<CarListing[]>([]);
  const { formatPrice, formatMileage } = useApp();

  useEffect(() => {
    const params = new URLSearchParams({
      brand,
      model,
      exclude: excludeId,
      priceRub: String(priceRub),
      limit: '8',
    });
    fetch(`/api/cars/similar?${params}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCars(data))
      .catch(() => {});
  }, [brand, model, excludeId, priceRub]);

  if (cars.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {brand} {model}
      </h2>
      <div className="flex gap-4 overflow-x-auto snap-x pb-2 -mx-1 px-1">
        {cars.map((car) => (
          <Link
            key={car.id}
            href={`/catalog/${car.id}`}
            className="w-64 flex-shrink-0 snap-start rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="relative aspect-[16/10] bg-gray-100">
              <Image
                src={car.imageUrl}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover"
                sizes="256px"
                unoptimized
              />
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                {car.year}
              </div>
            </div>
            <div className="p-3">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {car.brand} {car.model}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {formatMileage(car.mileage)} · {car.fuel}
              </div>
              <div className="font-bold text-primary mt-1.5 text-sm">
                {formatPrice(car.price_turnkey_russia || 0)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
