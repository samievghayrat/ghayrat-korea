import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return new NextResponse(null, { status: 404 });
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: CarPhoto } = await import('@/models/CarPhoto');
    await dbConnect();
    const photo = await CarPhoto.findById(id);
    if (!photo) return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(photo.data), {
      headers: { 'Content-Type': photo.contentType, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch { return new NextResponse(null, { status: 503 }); }
}
