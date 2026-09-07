import { NextRequest, NextResponse } from 'next/server';
import { getSnapshotModelData } from '@/lib/encar-snapshot';

const cache = new Map<string, unknown>();

export async function GET(request: NextRequest) {
  const brand = request.nextUrl.searchParams.get('brand');
  if (!brand) {
    return NextResponse.json({ error: 'brand parameter required' }, { status: 400 });
  }

  const model = request.nextUrl.searchParams.get('model') || undefined;
  const variant = request.nextUrl.searchParams.get('variant') || undefined;
  const cacheKey = `${brand}:${model || ''}:${variant || ''}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const result = getSnapshotModelData(brand, model, variant);
  cache.set(cacheKey, result);
  return NextResponse.json(result);
}
