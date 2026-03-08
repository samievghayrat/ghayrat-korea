'use client';

import { useEffect, useState } from 'react';
import type { CarListing } from '@/types';
import CarGrid from '@/components/catalog/CarGrid';
import { useFavorites } from '@/hooks/useFavorites';
import { useApp } from '@/contexts/AppContext';

export default function FavoritesPage() {
  const { t } = useApp();
  const { favorites, clearFavorites } = useFavorites();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setCars([]);
      setLoading(false);
      return;
    }

    const fetchSequentially = async () => {
      const results: (CarListing | null)[] = [];
      for (const id of favorites) {
        try {
          const res = await fetch(`/api/cars/${id}`);
          if (res.ok) {
            const car = await res.json();
            results.push(car);
            setCars(results.filter((c): c is CarListing => c !== null));
          } else {
            results.push(null);
          }
        } catch {
          results.push(null);
        }
      }
      setLoading(false);
    };
    fetchSequentially();
  }, [favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('fav.title')}</h1>
          <p className="text-gray-500 mt-1">{favorites.length} {t('fav.count')}</p>
        </div>
        {favorites.length > 0 && (
          <button onClick={clearFavorites} className="text-sm text-red-500 hover:underline">
            {t('fav.clearAll')}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t('fav.empty')}</h3>
          <p className="text-gray-500 mb-6">{t('fav.emptyDesc')}</p>
          <a href="/catalog" className="btn-primary inline-block">{t('fav.goToCatalog')}</a>
        </div>
      ) : (
        <CarGrid cars={cars} loading={loading} />
      )}
    </div>
  );
}
