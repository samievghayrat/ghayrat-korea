import { getDamagedCatalogue } from '@/lib/damaged-cars-server';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return Response.json(await getDamagedCatalogue(true), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return Response.json({ error: 'Catalogue temporarily unavailable' }, { status: 503 });
  }
}
