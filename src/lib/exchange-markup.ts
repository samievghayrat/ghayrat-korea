import type { CarDestination } from './car-destination';

// Paired listing API prices already contain the catalogue's 2% conversion spread.
export const CATALOG_EXCHANGE_MARKUP = 1.02;
export const DESTINATION_EXCHANGE_MARKUP: Record<CarDestination, number> = {
  tajikistan: 1.02,
  russia: 1.04,
};

/** Rebase a catalogue conversion for the chosen country; never stack spreads. */
export function getDestinationConvertedPrice(amount: number, destination?: CarDestination): number {
  const markup = destination ? DESTINATION_EXCHANGE_MARKUP[destination] : CATALOG_EXCHANGE_MARKUP;
  if (markup === CATALOG_EXCHANGE_MARKUP) return amount;
  return Math.round(amount * markup / CATALOG_EXCHANGE_MARKUP);
}
