import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { detectCarPhotoType, MAX_PHOTO_BYTES } from '@/lib/own-car-input';

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  if (Number(request.headers.get('content-length')) > MAX_PHOTO_BYTES + 65536) return NextResponse.json({ error: 'Фото слишком большое.' }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get('photo');
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_PHOTO_BYTES) return NextResponse.json({ error: 'Выберите фото до 2 МБ.' }, { status: 400 });
    const data = Buffer.from(await file.arrayBuffer());
    const contentType = detectCarPhotoType(data);
    if (!contentType || contentType !== file.type) return NextResponse.json({ error: 'Поддерживаются JPG, PNG и WebP.' }, { status: 400 });
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: CarPhoto } = await import('@/models/CarPhoto');
    await dbConnect();
    const photo = await CarPhoto.create({ data, contentType });
    return NextResponse.json({ url: `/api/own-car-photos/${photo._id.toString()}` }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Не удалось загрузить фото. Попробуйте ещё раз.' }, { status: 503 }); }
}
