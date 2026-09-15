import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'ghayrat_admin';
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

export function adminPasswordMatches(password: unknown): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || typeof password !== 'string') return false;
  return timingSafeEqual(createHash('sha256').update(password).digest(), createHash('sha256').update(secret).digest());
}

export function createAdminSession(now = Date.now()): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('Admin access is not configured');
  const payload = `${now + ADMIN_SESSION_SECONDS * 1000}.${randomBytes(24).toString('hex')}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('hex')}`;
}

export function verifyAdminSession(token: string | undefined, now = Date.now()): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token || token.length > 160) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{48}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const expires = Number(parts[0]);
  if (!Number.isSafeInteger(expires) || expires <= now || expires > now + ADMIN_SESSION_SECONDS * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
  return timingSafeEqual(Buffer.from(parts[2], 'hex'), expected);
}

export function isAdminRequest(request: NextRequest): boolean {
  return verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
}

export function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

export function requireAdmin(request: NextRequest, write = false): NextResponse | null {
  if (write && !hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!isAdminRequest(request)) return NextResponse.json({ error: 'Войдите в панель управления.' }, { status: 401 });
  return null;
}
