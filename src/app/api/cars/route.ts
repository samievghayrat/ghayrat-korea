import { NextRequest, NextResponse } from 'next/server';
import { searchCars } from '@/lib/encar-api';
import type { CarFilters } from '@/types';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: CarFilters = {
    brand: params.get('brand') || undefined,
    model: params.get('model') || undefined,
    modelVariant: params.get('modelVariant') || undefined,
    badge: params.get('badge') || undefined,
    badgeDetail: params.get('badgeDetail') || undefined,
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
    hpFrom: params.get('hpFrom') ? parseInt(params.get('hpFrom')!) : undefined,
    hpTo: params.get('hpTo') ? parseInt(params.get('hpTo')!) : undefined,
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

  // Inject reservation statuses
  try {
    await dbConnect();
    const carIds = result.cars.map((c: { id: string }) => c.id);
    if (carIds.length > 0) {
      const reservations = await Reservation.find({ carId: { $in: carIds } }).lean();
      const statusMap = new Map(reservations.map((r) => [r.carId, r.status]));
      for (const car of result.cars) {
        const status = statusMap.get(car.id);
        if (status) car.reservationStatus = status;
      }
    }
  } catch {
    // Don't fail the response if reservation lookup fails
  }

  return NextResponse.json(result);
}
