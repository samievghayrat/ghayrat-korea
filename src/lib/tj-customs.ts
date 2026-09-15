import customsData from '@/data/tj-customs-minimums.json';
import { getCompactModelName } from './translations';

interface CustomsEntry {
  name: string;
  country: string;
  prices: Record<string, number>;
}

export interface TjCustomsMinimumMatch {
  minimumUsd: number;
  vehicleName: string;
  country: string;
}

const entries = customsData.entries as CustomsEntry[];

const BRAND_ALIASES: Record<string, string[]> = {
  'Mercedes-Benz': ['Mercedes Benz'],
  'Renault Korea': ['Renault Samsung', 'Renault'],
  'KG Mobility': ['SsangYong', 'Ssang Yong'],
  SsangYong: ['SsangYong', 'Ssang Yong'],
  'Rolls-Royce': ['Rolls Royce'],
};

function compact(value: string): string {
  return value
    .normalize('NFKC')
    // A few model names in the source table contain Cyrillic lookalikes.
    .replace(/[Аа]/g, 'a')
    .replace(/[Вв]/g, 'b')
    .replace(/[ЕеЁё]/g, 'e')
    .replace(/[Кк]/g, 'k')
    .replace(/[Мм]/g, 'm')
    .replace(/[Нн]/g, 'h')
    .replace(/[Оо]/g, 'o')
    .replace(/[Рр]/g, 'p')
    .replace(/[Сс]/g, 'c')
    .replace(/[Тт]/g, 't')
    .replace(/[Уу]/g, 'y')
    .replace(/[Хх]/g, 'x')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function brandAliases(brand: string): string[] {
  return BRAND_ALIASES[brand] || [brand];
}

/** Finds the customs table value for the vehicle's model and production year. */
export function lookupTjCustomsMinimum(
  brand: string,
  model: string,
  year: number,
  badge = '',
): TjCustomsMinimumMatch | undefined {
  if (!brand || !model || !Number.isFinite(year)) return undefined;

  const modelName = getCompactModelName(model);
  const modelKey = compact(modelName);
  const combinedKey = compact(`${modelName} ${badge}`);
  const aliases = brandAliases(brand).map(compact).filter(Boolean);

  let best: { entry: CustomsEntry; score: number } | undefined;

  for (const entry of entries) {
    const price = entry.prices[String(year)];
    if (!price) continue;

    const entryKey = compact(entry.name);
    const matchingAlias = aliases.find((alias) => entryKey.startsWith(alias));
    if (!matchingAlias) continue;

    const entryModelKey = entryKey.slice(matchingAlias.length);
    if (!entryModelKey) continue;

    let score = 0;
    if (entryModelKey === modelKey) {
      score = 10_000;
    } else if (entryModelKey.length >= 2 && combinedKey.includes(entryModelKey)) {
      // Prefer the most specific trim present in the badge (for example 520d xDrive).
      score = 8_000 + entryModelKey.length;
    } else if (modelKey.length >= 2 && entryModelKey.includes(modelKey)) {
      score = 6_000 - Math.max(0, entryModelKey.length - modelKey.length);
    }

    if (!score) continue;
    if (/korea/i.test(entry.country)) score += 50;

    if (!best || score > best.score) best = { entry, score };
  }

  if (!best) return undefined;

  return {
    minimumUsd: best.entry.prices[String(year)],
    vehicleName: best.entry.name,
    country: best.entry.country,
  };
}
