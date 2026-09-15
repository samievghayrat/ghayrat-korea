import { NextRequest, NextResponse } from 'next/server';
import { fetchEncarInspection } from '@/lib/fetch-encar-inspection';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id)) {
    return NextResponse.json({ error: 'Invalid car id' }, { status: 400 });
  }
  const result = await fetchEncarInspection(id);
  return NextResponse.json(result, {
    status: result.status === 'unavailable' ? 503 : 200,
    headers: {
      'Cache-Control': result.status === 'available'
        ? 'public, s-maxage=900, stale-while-revalidate=3600'
        : result.status === 'not_published' ? 'public, s-maxage=300' : 'no-store',
    },
  });
}
