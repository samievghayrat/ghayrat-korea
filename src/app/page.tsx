'use client';

import { useEffect, useState, Suspense } from 'react';
import { useFilters } from '@/hooks/useFilters';
import type { CarListing } from '@/types';
import CarGrid from '@/components/catalog/CarGrid';
import FilterChips from '@/components/catalog/FilterChips';
import Pagination from '@/components/catalog/Pagination';
import SortSelect from '@/components/catalog/SortSelect';
import EncarSearch from '@/components/catalog/EncarSearch';

interface BrandCount {
  name: string;
  nameKo: string;
  count: number;
}

function CatalogContent() {
  const { filters, setFilters, resetFilters } = useFilters();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brandCounts, setBrandCounts] = useState<BrandCount[]>([]);
  const [totalCars, setTotalCars] = useState(0);
  // Fetch brand counts once on mount
  useEffect(() => {
    fetch('/api/brand-counts')
      .then(res => res.json())
      .then(data => {
        setBrandCounts(data.brands || []);
        setTotalCars(data.total || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });

    fetch(`/api/cars?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCars(data.cars || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">

      <FilterChips filters={filters} onChange={setFilters} />

      {/* Mobile: compact inline filters */}
      <div className="lg:hidden">
        <div className="mb-4">
          <EncarSearch
            filters={filters}
            onChange={(f) => { setFilters(f); }}
            onReset={resetFilters}
            totalResults={total}
            brandCounts={brandCounts}
            totalCars={totalCars}
            compact
          />
        </div>

        {/* Results count + sort row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Поиск...
              </span>
            ) : (
              <span className="font-bold text-gray-900 text-lg">{total.toLocaleString('ru-RU')} <span className="font-normal text-sm text-gray-500">авто</span></span>
            )}
          </div>
          <SortSelect
            value={filters.sort || 'year_desc'}
            onChange={(sort) => setFilters({ ...filters, sort: sort as typeof filters.sort, page: 1 })}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-[300px] flex-shrink-0">
          <div className="lg:sticky lg:top-[104px] space-y-4">
            <EncarSearch
              filters={filters}
              onChange={(f) => { setFilters(f); }}
              onReset={resetFilters}
              totalResults={total}
              brandCounts={brandCounts}
              totalCars={totalCars}
            />
          </div>
        </aside>

        {/* Car grid */}
        <div className="flex-1 min-w-0">
          {/* Desktop controls bar */}
          <div className="hidden lg:flex mb-4 items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
            <div className="text-sm text-gray-500">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Поиск...
                </span>
              ) : (
                <>Найдено <span className="font-bold text-gray-900">{total.toLocaleString('ru-RU')}</span> авто</>
              )}
            </div>
            <SortSelect
              value={filters.sort || 'year_desc'}
              onChange={(sort) => setFilters({ ...filters, sort: sort as typeof filters.sort, page: 1 })}
            />
          </div>
          <CarGrid cars={cars} loading={loading} />
          <Pagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
              <div className="aspect-[16/10] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded" />
                </div>
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
