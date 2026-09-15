'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CarListing } from '@/types';
import { useApp } from '@/contexts/AppContext';
import CarGrid from '@/components/catalog/CarGrid';

export default function OurCarsClient() {
  const { t } = useApp();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    fetch('/api/own-cars', { signal: controller.signal, cache: 'no-store' })
      .then(async res => { if (!res.ok) throw new Error('Unavailable'); return res.json(); })
      .then(data => setCars(data.cars || []))
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">{t('own.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">{t('own.subtitle')}</p>
        <div className="mt-5">
          {loading ? <CarGrid cars={[]} loading /> : error ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center" role="alert">
              <p className="font-semibold text-gray-800">{t('own.unavailable')}</p>
              <button type="button" onClick={() => setRetry(v => v + 1)} className="btn-outline mt-4">{t('own.retry')}</button>
            </div>
          ) : cars.length > 0 ? <CarGrid cars={cars} /> : (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-semibold text-gray-900">{t('own.empty')}</h2>
              <p className="mt-2 text-sm text-gray-500">{t('own.emptyHint')}</p>
              <Link href="https://t.me/ghayrat_korea" target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 inline-block">{t('nav.writeManager')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
