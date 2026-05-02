import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

// GET all reservations
export async function GET() {
  await dbConnect();
  const reservations = await Reservation.find().sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ reservations });
}

// POST — create or update a reservation
export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();
  const { carId, status, note } = body;

  if (!carId || !status) {
    return NextResponse.json({ error: 'carId and status required' }, { status: 400 });
  }

  const reservation = await Reservation.findOneAndUpdate(
    { carId },
    { carId, status, note },
    { upsert: true, new: true }
  );

  return NextResponse.json({ reservation });
}
