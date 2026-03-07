import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Message } = await import('@/models/Message');
    await dbConnect();

    const body = await request.json();
    await Message.findByIdAndUpdate(params.id, body);
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
    const { default: Message } = await import('@/models/Message');
    await dbConnect();

    await Message.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
