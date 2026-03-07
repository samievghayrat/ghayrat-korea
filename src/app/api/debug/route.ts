import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://api.encar.com/search/car/list/general?count=true&q=(And.Hidden.N.)&sr=%7CModifiedDate%7C0%7C1';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    const status = res.status;
    const text = await res.text();

    return NextResponse.json({
      status,
      ok: res.ok,
      body: text.substring(0, 500),
      region: process.env.VERCEL_REGION || 'unknown',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      error: message,
      region: process.env.VERCEL_REGION || 'unknown',
    });
  }
}
