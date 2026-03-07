import { NextRequest, NextResponse } from 'next/server';
import { getCarDetail } from '@/lib/encar-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const car = await getCarDetail(params.id);
  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }
  return NextResponse.json(car);
}
