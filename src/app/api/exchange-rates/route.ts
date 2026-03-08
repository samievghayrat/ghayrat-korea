import { NextResponse } from 'next/server';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
let cache: { rates: Record<string, number>; timestamp: number } | null = null;

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/RUB', {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        USD: 1 / (data.rates?.USD ? 1 / data.rates.USD : 87.5),
        EUR: 1 / (data.rates?.EUR ? 1 / data.rates.EUR : 95.2),
        KRW: data.rates?.KRW ? 1 / data.rates.KRW : 0.062,
      };
    }
  } catch {}

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/KRW', {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const krwToRub = data.rates?.RUB || 0.062;
      const krwToUsd = data.rates?.USD || 0.00073;
      const krwToEur = data.rates?.EUR || 0.00065;
      return {
        USD: krwToRub / krwToUsd,
        EUR: krwToRub / krwToEur,
        KRW: krwToRub,
      };
    }
  } catch {}

  return { USD: 87.5, EUR: 95.2, KRW: 0.062 };
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.rates, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  }

  const rates = await fetchRates();
  cache = { rates, timestamp: Date.now() };

  return NextResponse.json(rates, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
