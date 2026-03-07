import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export async function GET() {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Settings } = await import('@/models/Settings');
    await dbConnect();

    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Settings } = await import('@/models/Settings');
    await dbConnect();

    const body = await request.json();
    let settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, body);
      await settings.save();
    } else {
      settings = await Settings.create(body);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
