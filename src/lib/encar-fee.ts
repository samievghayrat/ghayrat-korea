import type { CarListing } from '@/types';

export const ENCAR_FEE_KRW = 440_000;

export function getEncarFeeKrw(source: CarListing['source']): number {
  return source === 'encar' ? ENCAR_FEE_KRW : 0;
}

export function getPriceIncludingEncarFee(
  car: Pick<CarListing, 'source' | 'price_krw' | 'price_rub' | 'price_usd'>,
) {
  const feeKrw = getEncarFeeKrw(car.source);
  if (feeKrw === 0 || car.price_krw <= 0) {
    return {
      priceKrw: car.price_krw,
      priceRub: car.price_rub,
      priceUsd: car.price_usd,
    };
  }

  const feeRatio = feeKrw / car.price_krw;

  return {
    priceKrw: car.price_krw + feeKrw,
    priceRub: car.price_rub + Math.round(car.price_rub * feeRatio),
    priceUsd: car.price_usd
      ? car.price_usd + Math.round(car.price_usd * feeRatio)
      : undefined,
  };
}
