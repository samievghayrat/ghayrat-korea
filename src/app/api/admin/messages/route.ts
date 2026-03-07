import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Message } = await import('@/models/Message');
    await dbConnect();

    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
