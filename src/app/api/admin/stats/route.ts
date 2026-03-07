import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    const { default: Message } = await import('@/models/Message');
    await dbConnect();

    const [totalCars, totalMessages, unreadMessages] = await Promise.all([
      Car.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ isRead: false }),
    ]);

    return NextResponse.json({ totalCars, totalMessages, unreadMessages });
  } catch {
    return NextResponse.json({ totalCars: 0, totalMessages: 0, unreadMessages: 0 });
  }
}
