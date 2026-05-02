import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

export const dynamic = 'force-dynamic';

// GET reservations — optionally filter by carIds query param (comma-separated)
export async function GET(request: NextRequest) {
  await dbConnect();
  const idsParam = request.nextUrl.searchParams.get('ids');

  if (idsParam) {
    const ids = idsParam.split(',');
    const reservations = await Reservation.find({ carId: { $in: ids } }).lean();
    const map: Record<string, string> = {};
    for (const r of reservations) {
      map[r.carId] = r.status;
    }
    return NextResponse.json({ reservations: map });
  }

  // Return all reservations as a map
  const reservations = await Reservation.find().lean();
  const map: Record<string, string> = {};
  for (const r of reservations) {
    map[r.carId] = r.status;
  }
  return NextResponse.json({ reservations: map });
}
