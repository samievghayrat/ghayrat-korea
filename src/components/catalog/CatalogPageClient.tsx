'use client';

import { useRouter } from 'next/navigation';
import type { CarListing } from '@/types';
import { useFilters } from '@/hooks/useFilters';
import { useApp } from '@/contexts/AppContext';
import CarGrid from '@/components/catalog/CarGrid';
import Pagination from '@/components/catalog/Pagination';
import SortSelect from '@/components/catalog/SortSelect';
import EncarSearch from '@/components/catalog/EncarSearch';
import CatalogWelcome from '@/components/catalog/CatalogWelcome';
import type { CatalogNavigation } from '@/lib/catalog-navigation';

interface CatalogPageClientProps {
  cars: CarListing[];
  total: number;
  totalPages: number;
  error?: boolean;
  navigation: CatalogNavigation;
}

export default function CatalogPageClient({ cars, total, totalPages, error = false, navigation }: CatalogPageClientProps) {
  const { t } = useApp();
  const { filters, setFilters, resetFilters, isUpdating } = useFilters();
  const router = useRouter();
  const { brands: brandCounts, total: totalCars } = navigation;

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
              navigation={navigation}
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
                navigation={navigation}
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

            <div aria-busy={isUpdating} className="relative">
              {isUpdating && (
                <div role="status" className="pointer-events-none absolute inset-x-0 -top-1 z-10 h-0.5 animate-pulse bg-primary">
                  <span className="sr-only">{t('search.loading')}</span>
                </div>
              )}
              <CarGrid cars={cars} loading={isUpdating} error={error} onRetry={() => router.refresh()} />
            </div>
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
