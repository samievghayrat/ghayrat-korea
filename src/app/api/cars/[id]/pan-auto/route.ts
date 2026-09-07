import { NextRequest, NextResponse } from 'next/server';
import { enrichDetailWithPanAuto, getCarDetail } from '@/lib/encar-api';

export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!/^\d{6,12}$/.test(params.id)) {
    return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
  }

  const car = await getCarDetail(params.id);
  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }

  const enhanced = await enrichDetailWithPanAuto(car);
  if (!enhanced.horsepowerSource && !enhanced.panAutoCustoms) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(enhanced, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' },
  });
}
