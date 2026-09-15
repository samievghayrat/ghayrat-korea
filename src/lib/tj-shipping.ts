export const TJ_CONTAINER_SHIPPING_USD = 3000;
export const TJ_SUV_CONTAINER_SHIPPING_USD = 3200;

interface ShippingVehicle {
  bodyType?: string;
  brand?: string;
  model?: string;
}

// The saved search feed often omits body type. These established model families
// also appear as SUVs in our local vehicle data; explicit body data takes priority.
const suvModels: Record<string, string[]> = {
  hyundai: ['tucson', 'palisade', 'santafe', 'ioniq5', 'kona', 'venue'],
  kia: ['sportage', 'sorento', 'seltos', 'ev6', 'niro', 'mohave'],
  genesis: ['gv60', 'gv70', 'gv80'],
  chevrolet: ['trailblazer'],
  ssangyong: ['torres', 'rexton'],
  kgmobility: ['torres', 'rexton'],
  bmw: ['x3', 'x5'],
  mercedesbenz: ['glc', 'gle'],
  toyota: ['rav4'],
  lexus: ['rx', 'nx'],
  volkswagen: ['tiguan'],
  audi: ['q5'],
  volvo: ['xc60', 'xc90'],
  porsche: ['cayenne', 'macan'],
  tesla: ['modely'],
};

/** Uses Encar's body classification, falling back to known SUV model families. */
export function getTjContainerShippingUsd({ bodyType = '', brand = '', model = '' }: ShippingVehicle): number {
  const isSuv = /\bsuv\b|crossover|sport[ -]?utility|кроссовер|внедорожник/i.test(bodyType);
  if (isSuv) return TJ_SUV_CONTAINER_SHIPPING_USD;
  if (/sedan|saloon|hatchback|coupe|convertible|wagon|minivan|\brv\b|pickup|\bvan\b|седан|хэтчбек|купе|кабриолет|универсал|минив[эе]н|фургон|пикап|세단|해치백|왜건|쿠페|미니밴|픽업|밴/i.test(bodyType)) {
    return TJ_CONTAINER_SHIPPING_USD;
  }
  const brandKey = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const modelKey = getCompactModelName(model).toLowerCase().replace(/[\s_-]/g, '');
  const models = Object.prototype.hasOwnProperty.call(suvModels, brandKey) ? suvModels[brandKey] : [];
  return models.some(name => modelKey.startsWith(name)) ? TJ_SUV_CONTAINER_SHIPPING_USD : TJ_CONTAINER_SHIPPING_USD;
}
import { getCompactModelName } from './translations';
