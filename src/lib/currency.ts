interface RateCache {
  rate: number;
  usdRate: number;
  eurRate: number;
  timestamp: number;
}

let cache: RateCache | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const FALLBACK_KRW_TO_RUB = 0.068;
const FALLBACK_KRW_TO_USD = 0.00073;
const FALLBACK_KRW_TO_EUR = 0.00065;

// +2% markup on exchange rate (buy/sell spread)
const MARKUP = 1.02;

async function fetchRates(): Promise<{ rubRate: number; usdRate: number; eurRate: number }> {
  // Primary: Google Finance compatible rate via exchangerate-api
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/KRW', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        rubRate: (data.rates?.RUB || FALLBACK_KRW_TO_RUB) * MARKUP,
        usdRate: (data.rates?.USD || FALLBACK_KRW_TO_USD) * MARKUP,
        eurRate: (data.rates?.EUR || FALLBACK_KRW_TO_EUR) * MARKUP,
      };
    }
  } catch { /* try fallback */ }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/KRW');
    if (res.ok) {
      const data = await res.json();
      return {
        rubRate: (data.rates?.RUB || FALLBACK_KRW_TO_RUB) * MARKUP,
        usdRate: (data.rates?.USD || FALLBACK_KRW_TO_USD) * MARKUP,
        eurRate: (data.rates?.EUR || FALLBACK_KRW_TO_EUR) * MARKUP,
      };
    }
  } catch { /* use fallback */ }

  return {
    rubRate: FALLBACK_KRW_TO_RUB * MARKUP,
    usdRate: FALLBACK_KRW_TO_USD * MARKUP,
    eurRate: FALLBACK_KRW_TO_EUR * MARKUP,
  };
}

async function getRates(): Promise<RateCache> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache;
  }
  const { rubRate, usdRate, eurRate } = await fetchRates();
  cache = { rate: rubRate, usdRate, eurRate, timestamp: Date.now() };
  return cache;
}

export async function convertKrwToRub(amount: number, markup = 1.0): Promise<number> {
  const { rate } = await getRates();
  return Math.round(amount * rate * markup);
}

export async function convertKrwToUsd(amount: number): Promise<number> {
  const { usdRate } = await getRates();
  return Math.round(amount * usdRate);
}

export async function convertKrwToEur(amount: number): Promise<number> {
  const { eurRate } = await getRates();
  return Math.round(amount * eurRate);
}

/** Get EUR→RUB rate (derived from KRW rates) */
export async function getEurToRub(): Promise<number> {
  const { rate, eurRate } = await getRates();
  return rate / eurRate;
}

/** Get USD→RUB rate (derived from KRW rates) */
export async function getUsdToRub(): Promise<number> {
  const { rate, usdRate } = await getRates();
  return rate / usdRate;
}

export function formatPrice(price: number, currency: 'RUB' | 'USD' | 'KRW' = 'RUB'): string {
  const locales: Record<string, string> = { RUB: 'ru-RU', USD: 'en-US', KRW: 'ko-KR' };
  const symbols: Record<string, string> = { RUB: '₽', USD: '$', KRW: '₩' };

  return new Intl.NumberFormat(locales[currency], {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' ' + symbols[currency];
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('ru-RU').format(km) + ' км';
}
