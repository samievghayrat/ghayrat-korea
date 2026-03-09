'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { CarFilters } from '@/types';

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: CarFilters = useMemo(() => ({
    brand: searchParams.get('brand') || undefined,
    model: searchParams.get('model') || undefined,
    modelVariant: searchParams.get('modelVariant') || undefined,
    badge: searchParams.get('badge') || undefined,
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
    transmission: searchParams.get('transmission') || undefined,
    drivetrain: searchParams.get('drivetrain') || undefined,
    color: searchParams.get('color') || undefined,
    options: searchParams.get('options') ? searchParams.get('options')!.split(',') : undefined,
    sort: (searchParams.get('sort') as CarFilters['sort']) || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);

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
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { filters, setFilters, resetFilters };
}
