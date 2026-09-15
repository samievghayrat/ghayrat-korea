import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminPasswordMatches, createAdminSession, hasSameOrigin, isAdminRequest } from '@/lib/admin-auth';

const attempts = new Map<string, { count: number; until: number }>();

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdminRequest(request) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Вход администратора не настроен.' }, { status: 503 });
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  for (const [ip, value] of attempts) if (value.until <= now) attempts.delete(ip);
  const attempt = attempts.get(key);
  if (attempt && attempt.count >= 10) return NextResponse.json({ error: 'Слишком много попыток. Попробуйте через 15 минут.' }, { status: 429 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  if (!adminPasswordMatches(body?.password)) {
    if (attempts.size > 10000) attempts.clear();
    attempts.set(key, { count: (attempt?.count || 0) + 1, until: attempt?.until || now + 15 * 60 * 1000 });
    return NextResponse.json({ error: 'Неверный пароль.' }, { status: 401 });
  }
  attempts.delete(key);
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
