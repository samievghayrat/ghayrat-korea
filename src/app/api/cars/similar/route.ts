import { NextRequest, NextResponse } from 'next/server';
import { searchCars } from '@/lib/encar-api';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const brand = params.get('brand');
  const model = params.get('model');
  const exclude = params.get('exclude') || '';
  const priceRub = parseInt(params.get('priceRub') || '0');
  const limit = parseInt(params.get('limit') || '8');

  if (!brand) {
    return NextResponse.json([]);
  }

  // Search by same brand + model if available, otherwise just brand
  const result = await searchCars({
    brand,
    model: model || undefined,
    limit: 20,
  });

  // Filter by ±30% price range and exclude current car
  const minPrice = priceRub * 0.7;
  const maxPrice = priceRub * 1.3;

  const similar = result.cars
    .filter((car) => car.id !== exclude)
    .filter((car) => priceRub === 0 || (car.price_rub >= minPrice && car.price_rub <= maxPrice))
    .slice(0, limit);

  return NextResponse.json(similar);
}
