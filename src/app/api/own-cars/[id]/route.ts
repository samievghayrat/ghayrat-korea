import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getOwnCar } from '@/lib/own-cars';
import { validateOwnCarInput } from '@/lib/own-car-input';
import { convertKrwToRub, convertKrwToUsd, convertUsdToKrw } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const admin = request.nextUrl.searchParams.get('admin') === '1';
  if (admin) { const denied = requireAdmin(request); if (denied) return denied; }
  try {
    if (!admin) {
      const car = await getOwnCar(id);
      return car ? NextResponse.json(car, { headers: { 'Cache-Control': 'no-store' } }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    await dbConnect();

    const car = await Car.findById(id).lean();
    if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!car.price_usd && car.price_krw > 0) car.price_usd = await convertKrwToUsd(Number(car.price_krw));
    return NextResponse.json(car, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Не удалось загрузить автомобиль.' }, { status: 503 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    const car = await Car.findByIdAndUpdate(id, { $set: { ...input, price_krw: priceKrw, price_rub: priceRub, price_usd: priceUsd } }, { runValidators: true });
    return car ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Не удалось сохранить изменения.' }, { status: 503 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    await dbConnect();

    const car = await Car.findByIdAndDelete(id);
    return car ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Не удалось удалить автомобиль.' }, { status: 503 });
  }
}
