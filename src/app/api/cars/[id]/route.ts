import { NextRequest, NextResponse } from 'next/server';
import { getCarDetail } from '@/lib/encar-api';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const car = await getCarDetail(id);
  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }

  // Check reservation status
  try {
    await dbConnect();
    const reservation = await Reservation.findOne({ carId: id }).lean();
    if (reservation) {
      car.reservationStatus = reservation.status;
    }
  } catch {
    // Don't fail if reservation lookup fails
  }

  return NextResponse.json(car);
}
