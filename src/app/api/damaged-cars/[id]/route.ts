import { getDamagedCar } from '@/lib/damaged-cars-server';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const car = await getDamagedCar(id, true);
    if (!car) return Response.json({ error: 'Vehicle not found' }, { status: 404 });
    return Response.json({ car }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
  } catch {
    return Response.json({ error: 'Vehicle temporarily unavailable' }, { status: 503 });
  }
}
