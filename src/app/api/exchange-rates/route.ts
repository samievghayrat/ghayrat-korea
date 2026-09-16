import { NextResponse } from 'next/server';
import { fetchGoogleFinanceRate } from '@/lib/google-finance';

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
let cache: { rates: Record<string, number>; timestamp: number } | null = null;

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const [krwToRub, usdToRub, eurToRub, tjsToRub] = await Promise.all([
      fetchGoogleFinanceRate('KRW', 'RUB', 3500),
      fetchGoogleFinanceRate('USD', 'RUB', 3500),
      fetchGoogleFinanceRate('EUR', 'RUB', 3500),
      fetchGoogleFinanceRate('TJS', 'RUB', 3500),
    ]);
    if (krwToRub > 0.02 && krwToRub < 0.2
      && usdToRub > 20 && usdToRub < 300
      && eurToRub > 20 && eurToRub < 400
      && tjsToRub > 1 && tjsToRub < 50) {
      return { USD: usdToRub, EUR: eurToRub, KRW: krwToRub, TJS: tjsToRub };
    }
  } catch { /* try fallback */ }

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/RUB', {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        USD: data.rates?.USD ? 1 / data.rates.USD : 87.5,
        EUR: data.rates?.EUR ? 1 / data.rates.EUR : 95.2,
        KRW: data.rates?.KRW ? 1 / data.rates.KRW : 0.062,
        TJS: data.rates?.TJS ? 1 / data.rates.TJS : 9.36,
      };
    }
  } catch {}

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/KRW', {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      const krwToRub = data.rates?.RUB || 0.062;
      const krwToUsd = data.rates?.USD || 0.00073;
      const krwToEur = data.rates?.EUR || 0.00065;
      const krwToTjs = data.rates?.TJS || 0.00662;
      return {
        USD: krwToRub / krwToUsd,
        EUR: krwToRub / krwToEur,
        KRW: krwToRub,
        TJS: krwToRub / krwToTjs,
      };
    }
  } catch {}

  return { USD: 87.5, EUR: 95.2, KRW: 0.062, TJS: 9.36 };
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
