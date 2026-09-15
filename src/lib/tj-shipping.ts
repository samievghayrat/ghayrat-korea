export const TJ_CONTAINER_SHIPPING_USD = 3000;
export const TJ_SUV_CONTAINER_SHIPPING_USD = 3200;

interface ShippingVehicle {
  bodyType?: string;
}

/** Uses Encar's body classification, including its translated SUV labels. */
export function getTjContainerShippingUsd({ bodyType = '' }: ShippingVehicle): number {
  const isSuv = /\bsuv\b|crossover|sport[ -]?utility|кроссовер|внедорожник/i.test(bodyType);
  return isSuv ? TJ_SUV_CONTAINER_SHIPPING_USD : TJ_CONTAINER_SHIPPING_USD;
}
