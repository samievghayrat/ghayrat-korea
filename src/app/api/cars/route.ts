import { NextRequest, NextResponse } from 'next/server';
import { searchCars } from '@/lib/encar-api';
import type { CarFilters } from '@/types';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: CarFilters = {
    brand: params.get('brand') || undefined,
    model: params.get('model') || undefined,
    modelVariant: params.get('modelVariant') || undefined,
    yearFrom: params.get('yearFrom') ? parseInt(params.get('yearFrom')!) : undefined,
    yearTo: params.get('yearTo') ? parseInt(params.get('yearTo')!) : undefined,
    monthFrom: params.get('monthFrom') ? parseInt(params.get('monthFrom')!) : undefined,
    monthTo: params.get('monthTo') ? parseInt(params.get('monthTo')!) : undefined,
    priceFrom: params.get('priceFrom') ? parseInt(params.get('priceFrom')!) : undefined,
    priceTo: params.get('priceTo') ? parseInt(params.get('priceTo')!) : undefined,
    fuel: params.get('fuel') || undefined,
    bodyType: params.get('bodyType') || undefined,
    mileageFrom: params.get('mileageFrom') ? parseInt(params.get('mileageFrom')!) : undefined,
    mileageTo: params.get('mileageTo') ? parseInt(params.get('mileageTo')!) : undefined,
    transmission: params.get('transmission') || undefined,
    drivetrain: params.get('drivetrain') || undefined,
    color: params.get('color') || undefined,
    options: params.get('options') ? params.get('options')!.split(',') : undefined,
    sort: (params.get('sort') as CarFilters['sort']) || undefined,
    page: params.get('page') ? parseInt(params.get('page')!) : 1,
    limit: params.get('limit') ? parseInt(params.get('limit')!) : 24,
    search: params.get('search') || undefined,
  };

  const result = await searchCars(filters);
  return NextResponse.json(result);
}
