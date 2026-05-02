import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

// DELETE a reservation by carId
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  await Reservation.findOneAndDelete({ carId: params.id });
  return NextResponse.json({ success: true });
}
