'use client';

import { useEffect, useState, Suspense } from 'react';
import { useFilters } from '@/hooks/useFilters';
import type { CarListing } from '@/types';
import CarGrid from '@/components/catalog/CarGrid';
import Pagination from '@/components/catalog/Pagination';
import SortSelect from '@/components/catalog/SortSelect';
import EncarSearch from '@/components/catalog/EncarSearch';
import { useApp } from '@/contexts/AppContext';

type SourceTab = 'encar' | 'auction' | 'forSale';

interface BrandCount {
  name: string;
  nameKo: string;
  count: number;
}

function CatalogContent() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<SourceTab>('encar');
  const { filters, setFilters, resetFilters } = useFilters();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brandCounts, setBrandCounts] = useState<BrandCount[]>([]);
  const [totalCars, setTotalCars] = useState(0);

  // Own cars state
  const [ownCars, setOwnCars] = useState<CarListing[]>([]);
  const [ownLoading, setOwnLoading] = useState(false);

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

  // Fetch own cars when For Sale tab is active
  useEffect(() => {
    if (activeTab !== 'forSale') return;
    setOwnLoading(true);
    fetch('/api/own-cars')
      .then(res => res.json())
      .then(data => {
        setOwnCars((data.cars || []).filter((c: CarListing) => c.isActive !== false));
        setOwnLoading(false);
      })
      .catch(() => setOwnLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'encar') return;
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
  }, [filters, activeTab]);

  const tabs: { key: SourceTab; label: string }[] = [
    { key: 'encar', label: t('tab.encar') },
    { key: 'auction', label: t('tab.auction') },
    { key: 'forSale', label: t('tab.forSale') },
  ];
  const deliveryCountries = [
    { flag: '🇷🇺', label: t('country.russia') },
    { flag: '🇹🇯', label: t('country.tajikistan') },
    { flag: '🇺🇿', label: t('country.uzbekistan') },
    { flag: '🇰🇿', label: t('country.kazakhstan') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
      <section className="mb-5 rounded-2xl bg-gray-950 px-4 py-5 sm:px-6 lg:px-7 text-white overflow-hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mt-2 text-sm sm:text-base text-white/65">
              {t('home.heroSubtitle')}
            </p>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/45">{t('home.deliveryTo')}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {deliveryCountries.map((country) => (
                  <span key={country.label} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/80">
                    <span className="text-base leading-none">{country.flag}</span>
                    {country.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-xl bg-white/10 px-3 py-3">
              <div className="text-lg font-bold">{totalCars ? totalCars.toLocaleString('ru-RU') : '...'}</div>
              <div className="text-[11px] text-white/55">{t('home.liveCars')}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-3">
              <div className="text-lg font-bold">2</div>
              <div className="text-[11px] text-white/55">{t('home.yearsInKorea')}</div>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-3">
              <div className="text-lg font-bold">1000+</div>
              <div className="text-[11px] text-white/55">{t('home.carsDelivered')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Source tabs */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); }}
              className={`min-w-fit text-sm font-semibold py-2.5 px-4 rounded-xl border transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-gray-950 border-gray-200 shadow-sm'
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-800 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'encar' && (
          <div className="inline-flex w-fit items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
            {loading ? t('search.searching') : (
              <>
                <span className="font-bold text-gray-900">{total.toLocaleString('ru-RU')}</span>
                <span className="ml-1">{t('search.cars')}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Auction tab - coming soon */}
      {activeTab === 'auction' && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏷️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kcar Auction</h2>
          <p className="text-gray-500">{t('search.comingSoon')}</p>
        </div>
      )}

      {/* For Sale tab - own cars */}
      {activeTab === 'forSale' && (
        <div>
          <CarGrid cars={ownCars} loading={ownLoading} />
          {!ownLoading && ownCars.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">{t('search.noCars')}</p>
            </div>
          )}
        </div>
      )}

      {/* Encar tab - main catalog */}
      {activeTab === 'encar' && (
        <>

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

        {/* Sort row */}
        <div className="mb-4 flex items-center justify-end">
          <div className="sr-only" aria-live="polite">
            {loading ? t('search.searching') : `${total.toLocaleString('ru-RU')} ${t('search.cars')}`}
          </div>
          <SortSelect
            value={filters.sort || 'year_desc'}
            onChange={(sort) => setFilters({ ...filters, sort: sort as typeof filters.sort, page: 1 })}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-[320px] flex-shrink-0">
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
          <div className="hidden lg:flex mb-4 items-center justify-between bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
            <div className="text-sm text-gray-500">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('search.searching')}
                </span>
              ) : t('tab.encar')}
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
        </>
      )}
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
