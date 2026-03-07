import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://api.encar.com/search/car/list/general?count=true&q=(And.Hidden.N.)&sr=%7CModifiedDate%7C0%7C1';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const status = res.status;
    const text = await res.text();

    return NextResponse.json({
      status,
      ok: res.ok,
      body: text.substring(0, 500),
      region: process.env.VERCEL_REGION || 'unknown',
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? { message: error.message, cause: String(error.cause || ''), name: error.name } : String(error);
    return NextResponse.json({
      error: err,
      region: process.env.VERCEL_REGION || 'unknown',
    });
  }
}
