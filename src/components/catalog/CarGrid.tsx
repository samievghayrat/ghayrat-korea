'use client';

import type { CarListing } from '@/types';
import { useApp } from '@/contexts/AppContext';
import CarCard from './CarCard';

interface CarGridProps {
  cars: CarListing[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export default function CarGrid({ cars, loading, error, onRetry }: CarGridProps) {
  const { t } = useApp();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse shadow-sm">
            <div className="aspect-[16/10] bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded" />
                <div className="h-3 bg-gray-100 rounded" />
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-6 py-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-600 shadow-sm">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v4m0 4h.01M10.3 3.86 2.82 16.5A2 2 0 0 0 4.54 19.5h14.92a2 2 0 0 0 1.72-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-800">{t('search.unavailableTitle')}</h3>
        <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-gray-600">
          {t('search.unavailableHint')}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:ring-offset-amber-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.58m15.36 2a8 8 0 0 0-15.36-2m0 0H9m11 11v-5h-.58m0 0a8 8 0 0 1-15.36-2m15.36 2H15" />
            </svg>
            {t('search.retry')}
          </button>
        )}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">{t('search.noCars')}</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          {t('search.noCarsHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cars.map((car, index) => (
        <CarCard key={car.id} car={car} priority={index < 6} />
      ))}
    </div>
  );
}
