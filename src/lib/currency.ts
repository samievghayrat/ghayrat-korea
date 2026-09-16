import { CATALOG_EXCHANGE_MARKUP } from './exchange-markup';
import { fetchGoogleFinanceRate } from './google-finance';

interface RateCache {
  rate: number;
  usdRate: number;
  eurRate: number;
  usdToRub: number;
  eurToRub: number;
  timestamp: number;
}

let cache: RateCache | null = null;
let pendingRates: Promise<RateCache> | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const GOOGLE_RATE_TIMEOUT_MS = 2200;
const FALLBACK_RATE_TIMEOUT_MS = 1000;
const FALLBACK_KRW_TO_RUB = 0.068;
const FALLBACK_KRW_TO_USD = 0.00073;
const FALLBACK_KRW_TO_EUR = 0.00065;

// Catalogue conversions retain 2%; the country quote rebases Russia to 4%.
const MARKUP = CATALOG_EXCHANGE_MARKUP;

interface CurrencyRates {
  rubRate: number;
  usdRate: number;
  eurRate: number;
  usdToRub: number;
  eurToRub: number;
}

function withCatalogMarkup(krwToRub: number, usdToRub: number, eurToRub: number): CurrencyRates {
  return {
    rubRate: krwToRub * MARKUP,
    usdRate: (krwToRub / usdToRub) * MARKUP,
    eurRate: (krwToRub / eurToRub) * MARKUP,
    usdToRub,
    eurToRub,
  };
}

async function fetchRates(): Promise<CurrencyRates> {
  // Google Finance is the primary market-rate source requested for the site.
  try {
    const [krwToRub, usdToRub, eurToRub] = await Promise.all([
      fetchGoogleFinanceRate('KRW', 'RUB', GOOGLE_RATE_TIMEOUT_MS),
      fetchGoogleFinanceRate('USD', 'RUB', GOOGLE_RATE_TIMEOUT_MS),
      fetchGoogleFinanceRate('EUR', 'RUB', GOOGLE_RATE_TIMEOUT_MS),
    ]);
    if (krwToRub > 0.02 && krwToRub < 0.2
      && usdToRub > 20 && usdToRub < 300
      && eurToRub > 20 && eurToRub < 400) {
      return withCatalogMarkup(krwToRub, usdToRub, eurToRub);
    }
  } catch { /* try fallback */ }

  // Public JSON providers keep prices available if Google temporarily blocks a server request.
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/KRW', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FALLBACK_RATE_TIMEOUT_MS),
    });
    if (res.ok) {
      const data = await res.json();
      const krwToRub = data.rates?.RUB || FALLBACK_KRW_TO_RUB;
      const krwToUsd = data.rates?.USD || FALLBACK_KRW_TO_USD;
      const krwToEur = data.rates?.EUR || FALLBACK_KRW_TO_EUR;
      return withCatalogMarkup(krwToRub, krwToRub / krwToUsd, krwToRub / krwToEur);
    }
  } catch { /* try fallback */ }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/KRW', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FALLBACK_RATE_TIMEOUT_MS),
    });
    if (res.ok) {
      const data = await res.json();
      const krwToRub = data.rates?.RUB || FALLBACK_KRW_TO_RUB;
      const krwToUsd = data.rates?.USD || FALLBACK_KRW_TO_USD;
      const krwToEur = data.rates?.EUR || FALLBACK_KRW_TO_EUR;
      return withCatalogMarkup(krwToRub, krwToRub / krwToUsd, krwToRub / krwToEur);
    }
  } catch { /* use fallback */ }

  return withCatalogMarkup(
    FALLBACK_KRW_TO_RUB,
    FALLBACK_KRW_TO_RUB / FALLBACK_KRW_TO_USD,
    FALLBACK_KRW_TO_RUB / FALLBACK_KRW_TO_EUR,
  );
}

async function getRates(): Promise<RateCache> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache;
  }
  if (!pendingRates) {
    pendingRates = fetchRates().then(({ rubRate, usdRate, eurRate, usdToRub, eurToRub }) => {
      cache = { rate: rubRate, usdRate, eurRate, usdToRub, eurToRub, timestamp: Date.now() };
      return cache;
    }).finally(() => { pendingRates = null; });
  }
  // Concurrent RUB/USD/EUR conversions share one refresh and rate snapshot.
  return pendingRates;
}

export async function convertKrwToRub(amount: number, markup = 1.0): Promise<number> {
  const { rate } = await getRates();
  return Math.round(amount * rate * markup);
}

export async function convertKrwToUsd(amount: number): Promise<number> {
  const { usdRate } = await getRates();
  return Math.round(amount * usdRate);
}

export async function convertUsdToKrw(amount: number): Promise<number> {
  const { usdRate } = await getRates();
  return Math.round(amount / usdRate);
}

export async function convertKrwToEur(amount: number): Promise<number> {
  const { eurRate } = await getRates();
  return Math.round(amount * eurRate);
}

/** Get the EUR→RUB market rate from the same cached snapshot. */
export async function getEurToRub(): Promise<number> {
  const { eurToRub } = await getRates();
  return eurToRub;
}

/** Get the USD→RUB market rate from the same cached snapshot. */
export async function getUsdToRub(): Promise<number> {
  const { usdToRub } = await getRates();
  return usdToRub;
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
