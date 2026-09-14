'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CarListing } from '@/types';
import { useFilters } from '@/hooks/useFilters';
import { useApp } from '@/contexts/AppContext';
import CarGrid from '@/components/catalog/CarGrid';
import Pagination from '@/components/catalog/Pagination';
import SortSelect from '@/components/catalog/SortSelect';
import EncarSearch from '@/components/catalog/EncarSearch';
import CatalogWelcome from '@/components/catalog/CatalogWelcome';

interface BrandCount {
  name: string;
  nameKo: string;
  count: number;
}

interface CatalogPageClientProps {
  cars: CarListing[];
  total: number;
  totalPages: number;
  error?: boolean;
}

export default function CatalogPageClient({ cars, total, totalPages, error = false }: CatalogPageClientProps) {
  const { t } = useApp();
  const { filters, setFilters, resetFilters } = useFilters();
  const router = useRouter();
  const [brandCounts, setBrandCounts] = useState<BrandCount[]>([]);
  const [totalCars, setTotalCars] = useState(total);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/brand-counts', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data) return;
        setBrandCounts(data.brands || []);
        setTotalCars(data.total || total);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [total]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <CatalogWelcome />

        <div className="lg:hidden">
          <div className="mb-4">
            <EncarSearch
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
              totalResults={total}
              brandCounts={brandCounts}
              totalCars={totalCars}
              compact
            />
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-gray-700" aria-live="polite">
              {total.toLocaleString('ru-RU')} {t('search.cars')}
            </div>
            <SortSelect
              value={filters.sort || 'year_desc'}
              onChange={(sort) => setFilters({ ...filters, sort: sort as typeof filters.sort, page: 1 })}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="relative z-40 hidden w-[320px] flex-shrink-0 lg:block">
            <div className="space-y-4 lg:sticky lg:top-[104px]">
              <EncarSearch
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
                totalResults={total}
                brandCounts={brandCounts}
                totalCars={totalCars}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 hidden items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm lg:flex">
              <div className="text-sm font-semibold text-gray-700" aria-live="polite">
                {t('search.found')}: {total.toLocaleString('ru-RU')} {t('search.cars')}
              </div>
              <SortSelect
                value={filters.sort || 'year_desc'}
                onChange={(sort) => setFilters({ ...filters, sort: sort as typeof filters.sort, page: 1 })}
              />
            </div>

            <CarGrid cars={cars} loading={false} error={error} onRetry={() => router.refresh()} />
            <Pagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
