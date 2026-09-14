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
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(236,253,245,0.62)_0px,rgba(248,250,252,0.82)_380px,#f8fafc_100%)]">
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

          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/85 p-2.5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900" aria-live="polite">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
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
            <div className="mb-4 hidden items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/60 px-4 py-3 shadow-sm lg:flex">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900" aria-live="polite">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
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
