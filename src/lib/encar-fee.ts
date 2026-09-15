import type { CarListing } from '@/types';
import type { CarDestination } from './car-destination';
import { getDestinationConvertedPrice } from './exchange-markup';

export const ENCAR_FEE_KRW = 440_000;

export function getEncarFeeKrw(source: CarListing['source']): number {
  return source === 'encar' ? ENCAR_FEE_KRW : 0;
}

export function getPriceIncludingEncarFee(
  car: Pick<CarListing, 'source' | 'price_krw' | 'price_rub' | 'price_usd'>,
  destination?: CarDestination,
) {
  const feeKrw = getEncarFeeKrw(car.source);
  const priceRub = getDestinationConvertedPrice(car.price_rub, destination);
  const priceUsd = car.price_usd
    ? getDestinationConvertedPrice(car.price_usd, destination)
    : undefined;
  if (feeKrw === 0 || car.price_krw <= 0) {
    return {
      priceKrw: car.price_krw,
      priceRub,
      priceUsd,
    };
  }

  const feeRatio = feeKrw / car.price_krw;

  return {
    priceKrw: car.price_krw + feeKrw,
    priceRub: priceRub + Math.round(priceRub * feeRatio),
    priceUsd: priceUsd
      ? priceUsd + Math.round(priceUsd * feeRatio)
      : undefined,
  };
}
