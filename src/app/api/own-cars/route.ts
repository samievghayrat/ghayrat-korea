import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getOwnCars } from '@/lib/own-cars';
import { validateOwnCarInput } from '@/lib/own-car-input';
import { convertKrwToRub, convertKrwToUsd, convertUsdToKrw } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const includeHidden = request.nextUrl.searchParams.get('admin') === '1';
  if (includeHidden) { const denied = requireAdmin(request); if (denied) return denied; }
  try {
    return NextResponse.json({ cars: await getOwnCars(includeHidden) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Не удалось загрузить автомобили. Попробуйте ещё раз.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  let input;
  try { input = validateOwnCarInput(await request.json()); } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Проверьте данные.' }, { status: 400 });
  }
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    const priceKrw = input.price_usd ? await convertUsdToKrw(input.price_usd) : input.price_krw!;
    const [priceRub, priceUsd] = await Promise.all([convertKrwToRub(priceKrw), input.price_usd ?? convertKrwToUsd(priceKrw)]);
    await dbConnect();
    const car = await Car.create({ ...input, price_krw: priceKrw, price_rub: priceRub, price_usd: priceUsd });
    return NextResponse.json({ id: car._id.toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Не удалось сохранить автомобиль. Попробуйте ещё раз.' }, { status: 503 });
  }
}
