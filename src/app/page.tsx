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
type DeliveryDestination = 'russia' | 'tajikistan';

interface BrandCount {
  name: string;
  nameKo: string;
  count: number;
}

function CatalogContent() {
  const { t } = useApp();
  const [activeTab] = useState<SourceTab>('encar');
  const [deliveryDestination] = useState<DeliveryDestination>('russia');
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

  const serviceSteps = [
    t('home.serviceSelect'),
    t('home.serviceInspect'),
    t('home.serviceDeliver'),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
      <section className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="px-4 py-3 sm:px-5">
            <p className="text-sm font-extrabold leading-snug text-gray-950 sm:text-base">
              {t('home.heroSubtitle')}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {serviceSteps.map((step, index) => (
                <span
                  key={step}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-950 text-[10px] text-white">
                    {index + 1}
                  </span>
                  {step}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 bg-emerald-50/60 px-4 py-3 sm:px-5 lg:min-w-[280px] lg:border-l lg:border-t-0">
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              {t('home.deliveryTo')}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {['\u{1F1F7}\u{1F1FA}', '\u{1F1F9}\u{1F1EF}', '\u{1F1FA}\u{1F1FF}', '\u{1F1F0}\u{1F1FF}'].map((flag) => (
                <span
                  key={flag}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base shadow-sm ring-1 ring-emerald-100"
                >
                  {flag}
                </span>
              ))}
            </div>
            <div className="mt-1.5 text-[11px] font-medium text-emerald-900/70">
              {t('home.deliveryNote')}
            </div>
          </div>
        </div>
      </section>

      {/* Auction tab - coming soon */}
      {activeTab === 'auction' && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">ðŸ·ï¸</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kcar Auction</h2>
          <p className="text-gray-500">{t('search.comingSoon')}</p>
        </div>
      )}

      {/* For Sale tab - own cars */}
      {activeTab === 'forSale' && (
        <div>
          <CarGrid cars={ownCars} loading={ownLoading} destination={deliveryDestination} />
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
          <div className="hidden lg:flex mb-4 items-center justify-end bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
            <SortSelect
              value={filters.sort || 'year_desc'}
              onChange={(sort) => setFilters({ ...filters, sort: sort as typeof filters.sort, page: 1 })}
            />
          </div>
          <CarGrid cars={cars} loading={loading} destination={deliveryDestination} />
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
