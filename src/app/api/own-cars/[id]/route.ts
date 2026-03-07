import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    await dbConnect();

    const car = await Car.findById(params.id).lean();
    if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(car);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    await dbConnect();

    const body = await request.json();
    await Car.findByIdAndUpdate(params.id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    await dbConnect();

    await Car.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
