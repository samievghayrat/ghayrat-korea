import type { CarFilters } from '@/types';
import { searchCars } from '@/lib/encar-api';
import CatalogPageClient from '@/components/catalog/CatalogPageClient';

export const revalidate = 900;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const parsed = Number(firstValue(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function buildFilters(params: SearchParams): CarFilters {
  const value = (key: string) => firstValue(params[key]) || undefined;
  return {
    brand: value('brand'),
    model: value('model'),
    modelVariant: value('modelVariant'),
    badge: value('badge'),
    badgeDetail: value('badgeDetail'),
    yearFrom: toNumber(params.yearFrom),
    yearTo: toNumber(params.yearTo),
    monthFrom: toNumber(params.monthFrom),
    monthTo: toNumber(params.monthTo),
    priceFrom: toNumber(params.priceFrom),
    priceTo: toNumber(params.priceTo),
    fuel: value('fuel'),
    bodyType: value('bodyType'),
    mileageFrom: toNumber(params.mileageFrom),
    mileageTo: toNumber(params.mileageTo),
    hpFrom: toNumber(params.hpFrom),
    hpTo: toNumber(params.hpTo),
    transmission: value('transmission'),
    drivetrain: value('drivetrain'),
    color: value('color'),
    options: value('options')?.split(',').filter(Boolean),
    sort: value('sort') as CarFilters['sort'],
    page: toNumber(params.page) || 1,
    limit: 24,
    search: value('search'),
  };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const result = await searchCars(buildFilters(await searchParams));

  return (
    <CatalogPageClient
      cars={result.cars}
      total={result.total}
      totalPages={result.totalPages}
      error={Boolean(result.error)}
    />
  );
}
