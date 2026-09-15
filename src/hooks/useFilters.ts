'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CarFilters } from '@/types';

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlFilters: CarFilters = useMemo(() => ({
    brand: searchParams.get('brand') || undefined,
    model: searchParams.get('model') || undefined,
    modelVariant: searchParams.get('modelVariant') || undefined,
    badge: searchParams.get('badge') || undefined,
    badgeDetail: searchParams.get('badgeDetail') || undefined,
    yearFrom: searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : undefined,
    yearTo: searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : undefined,
    monthFrom: searchParams.get('monthFrom') ? parseInt(searchParams.get('monthFrom')!) : undefined,
    monthTo: searchParams.get('monthTo') ? parseInt(searchParams.get('monthTo')!) : undefined,
    priceFrom: searchParams.get('priceFrom') ? parseInt(searchParams.get('priceFrom')!) : undefined,
    priceTo: searchParams.get('priceTo') ? parseInt(searchParams.get('priceTo')!) : undefined,
    fuel: searchParams.get('fuel') || undefined,
    bodyType: searchParams.get('bodyType') || undefined,
    mileageFrom: searchParams.get('mileageFrom') ? parseInt(searchParams.get('mileageFrom')!) : undefined,
    mileageTo: searchParams.get('mileageTo') ? parseInt(searchParams.get('mileageTo')!) : undefined,
    hpFrom: searchParams.get('hpFrom') ? parseInt(searchParams.get('hpFrom')!) : undefined,
    hpTo: searchParams.get('hpTo') ? parseInt(searchParams.get('hpTo')!) : undefined,
    transmission: searchParams.get('transmission') || undefined,
    drivetrain: searchParams.get('drivetrain') || undefined,
    color: searchParams.get('color') || undefined,
    options: searchParams.get('options') ? searchParams.get('options')!.split(',') : undefined,
    sort: (searchParams.get('sort') as CarFilters['sort']) || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);

  const query = searchParams.toString();
  const [optimistic, setOptimistic] = useState<{ filters: CarFilters; query: string; pathname: string } | null>(null);
  const filters = optimistic?.pathname === pathname ? optimistic.filters : urlFilters;
  const isUpdating = Boolean(optimistic?.pathname === pathname && optimistic.query !== query);

  // A slower, older result must not overwrite a newer brand/model selection.
  useEffect(() => {
    if (optimistic && (optimistic.pathname !== pathname || optimistic.query === query)) setOptimistic(null);
  }, [optimistic, pathname, query]);

  useEffect(() => {
    const onHistoryNavigation = () => setOptimistic(null);
    window.addEventListener('popstate', onHistoryNavigation);
    return () => window.removeEventListener('popstate', onHistoryNavigation);
  }, []);

  const setFilters = useCallback((newFilters: CarFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });
    const query = params.toString();
    // Update selectors now; the server-rendered car results can finish later.
    setOptimistic({ filters: newFilters, query, pathname });
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [router, pathname]);

  const resetFilters = useCallback(() => {
    setOptimistic({ filters: { page: 1 }, query: '', pathname });
    router.push(pathname);
  }, [router, pathname]);

  return { filters, setFilters, resetFilters, isUpdating };
}
