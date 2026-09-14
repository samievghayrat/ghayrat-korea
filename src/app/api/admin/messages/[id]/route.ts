import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Message } = await import('@/models/Message');
    await dbConnect();

    const body = await request.json();
    const { id } = await params;
    await Message.findByIdAndUpdate(id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Message } = await import('@/models/Message');
    await dbConnect();

    const { id } = await params;
    await Message.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
