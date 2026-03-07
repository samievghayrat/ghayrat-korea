import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, messenger, message, carId } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Имя, телефон и сообщение обязательны' },
        { status: 400 }
      );
    }

    // Try to save to MongoDB if available
    try {
      const { default: dbConnect } = await import('@/lib/mongodb');
      const { default: Message } = await import('@/models/Message');
      await dbConnect();

      await Message.create({
        name,
        phone,
        messenger: messenger || 'phone',
        message,
        carId: carId || null,
        isRead: false,
      });
    } catch {
      // MongoDB not configured - just log
      console.log('New contact message:', { name, phone, messenger, message, carId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
