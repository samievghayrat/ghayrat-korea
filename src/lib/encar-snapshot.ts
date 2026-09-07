import snapshotJson from '@/data/encar-snapshot.json';
import type { CarFilters } from '@/types';
import {
  reverseTranslateBrand,
  reverseTranslateModel,
  translateBrand,
  translateModel,
} from './translations';

interface SnapshotCar {
  Id?: string;
  Photo?: string;
  Manufacturer?: string;
  Model?: string;
  Badge?: string;
  BadgeDetail?: string;
  FuelType?: string;
  Year?: number;
  Mileage?: number;
  Price?: number;
  SellType?: string;
  Displacement?: number;
  MaxPower?: number;
  HorsePower?: number;
  Color?: string;
  BodyType?: string;
  Transmission?: string;
}

interface SnapshotData {
  generatedAt: string;
  sourceTotal: number;
  cars: SnapshotCar[];
}

interface SnapshotBrand {
  name: string;
  nameKo: string;
}

const snapshot = snapshotJson as unknown as SnapshotData;

function getBaseModelName(koreanModelName: string): string {
  let name = koreanModelName;
  for (const prefix of ['디 올 뉴 ', '더 뉴 ', '올 뉴 ', '더뉴 ', '올뉴 ', '뉴 ']) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }
  return name
    .replace(/\s*\d+세대$/, '')
    .replace(/\s*\([A-Z0-9]+\)$/, '')
    .replace(/\s*(하이브리드|쿠페|유로|플러스)$/, '')
    .trim();
}

function getYear(car: SnapshotCar): number {
  return Number.parseInt(String(car.Year || '').slice(0, 4), 10) || 0;
}

function matchesBrand(car: SnapshotCar, brand?: string): boolean {
  if (!brand) return true;
  const koreanBrand = reverseTranslateBrand(brand) || brand;
  return car.Manufacturer === koreanBrand || translateBrand(car.Manufacturer || '') === brand;
}

function matchesModel(car: SnapshotCar, model?: string): boolean {
  if (!model) return true;
  const koreanModel = reverseTranslateModel(model) || model;
  const rawModel = car.Model || '';
  const baseModel = getBaseModelName(rawModel);
  return rawModel === koreanModel
    || baseModel === koreanModel
    || rawModel.includes(koreanModel)
    || translateModel(baseModel) === model;
}

function matchesFuel(car: SnapshotCar, fuel?: string): boolean {
  if (!fuel) return true;
  const fuelMap: Record<string, string[]> = {
    gasoline: ['가솔린'],
    diesel: ['디젤'],
    hybrid: ['가솔린+전기', '디젤+전기', '하이브리드'],
    electric: ['전기'],
    lpg: ['LPG'],
  };
  return (fuelMap[fuel] || []).some(value => (car.FuelType || '').includes(value));
}

function matchesTransmission(car: SnapshotCar, transmission?: string): boolean {
  if (!transmission) return true;
  const transmissionMap: Record<string, string[]> = {
    auto: ['오토', '자동'],
    manual: ['수동'],
    dct: ['DCT'],
    cvt: ['CVT'],
  };
  return (transmissionMap[transmission] || []).some(value =>
    (car.Transmission || '').toUpperCase().includes(value.toUpperCase())
  );
}

function matchesColor(car: SnapshotCar, color?: string): boolean {
  if (!color) return true;
  const colorMap: Record<string, string[]> = {
    white: ['흰색'],
    black: ['검정색'],
    gray: ['회색'],
    silver: ['은색'],
    blue: ['파란색'],
    red: ['빨간색'],
    brown: ['갈색'],
    green: ['녹색'],
    other: ['기타'],
  };
  return (colorMap[color] || []).some(value => car.Color === value);
}

function matchesSearch(car: SnapshotCar, search?: string): boolean {
  if (!search) return true;
  const haystack = [
    car.Manufacturer,
    car.Model,
    car.Badge,
    car.BadgeDetail,
    translateBrand(car.Manufacturer || ''),
    translateModel(getBaseModelName(car.Model || '')),
  ].filter(Boolean).join(' ').toLocaleLowerCase();
  return haystack.includes(search.toLocaleLowerCase().trim());
}

function canApplySnapshotFilters(filters: CarFilters): boolean {
  if (filters.options?.length) return false;
  if (filters.hpFrom !== undefined || filters.hpTo !== undefined) return false;
  if (filters.drivetrain && filters.drivetrain !== 'awd') return false;
  return true;
}

function matchesFilters(car: SnapshotCar, filters: CarFilters): boolean {
  if (!matchesBrand(car, filters.brand)) return false;
  if (filters.modelVariant && car.Model !== filters.modelVariant) return false;
  if (!filters.modelVariant && !matchesModel(car, filters.model)) return false;
  if (filters.badge && car.Badge !== filters.badge) return false;
  if (filters.badgeDetail && car.BadgeDetail !== filters.badgeDetail) return false;
  if (!matchesFuel(car, filters.fuel)) return false;
  if (!matchesTransmission(car, filters.transmission)) return false;
  if (!matchesColor(car, filters.color)) return false;
  if (!matchesSearch(car, filters.search)) return false;

  const year = getYear(car);
  if (filters.yearFrom && year < filters.yearFrom) return false;
  if (filters.yearTo && year > filters.yearTo) return false;
  if (filters.monthFrom || filters.monthTo) {
    const month = Number.parseInt(String(car.Year || '').slice(4, 6), 10) || 0;
    if (filters.monthFrom && month < filters.monthFrom) return false;
    if (filters.monthTo && month > filters.monthTo) return false;
  }

  const price = car.Price || 0;
  if (filters.priceFrom !== undefined && price < filters.priceFrom) return false;
  if (filters.priceTo !== undefined && price > filters.priceTo) return false;

  const mileage = car.Mileage || 0;
  if (filters.mileageFrom !== undefined && mileage < filters.mileageFrom) return false;
  if (filters.mileageTo !== undefined && mileage > filters.mileageTo) return false;

  if (filters.drivetrain === 'awd') {
    const badge = car.Badge || '';
    if (!/(AWD|4WD|4MATIC|XDRIVE)/i.test(badge)) return false;
  }

  return true;
}

function sortCars(cars: SnapshotCar[], sort?: string): SnapshotCar[] {
  const sorted = [...cars];
  switch (sort) {
    case 'price_asc': return sorted.sort((a, b) => (a.Price || 0) - (b.Price || 0));
    case 'price_desc': return sorted.sort((a, b) => (b.Price || 0) - (a.Price || 0));
    case 'year_asc': return sorted.sort((a, b) => Number(a.Year || 0) - Number(b.Year || 0));
    case 'year_desc': return sorted.sort((a, b) => Number(b.Year || 0) - Number(a.Year || 0));
    case 'mileage_asc': return sorted.sort((a, b) => (a.Mileage || 0) - (b.Mileage || 0));
    case 'mileage_desc': return sorted.sort((a, b) => (b.Mileage || 0) - (a.Mileage || 0));
    default: return sorted;
  }
}

export function getSnapshotSearch(filters: CarFilters) {
  if (!snapshot.cars.length || !canApplySnapshotFilters(filters)) return null;

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const filtered = sortCars(snapshot.cars.filter(car => matchesFilters(car, filters)), filters.sort);
  const offset = (page - 1) * limit;

  return {
    rows: filtered.slice(offset, offset + limit) as unknown as Record<string, unknown>[],
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
    generatedAt: snapshot.generatedAt,
  };
}

export function getSnapshotCarById(carId: string): Record<string, unknown> | null {
  const car = snapshot.cars.find(item => String(item.Id || '') === carId);
  return car ? car as unknown as Record<string, unknown> : null;
}

export function getSnapshotBrandCounts(brands: readonly SnapshotBrand[]) {
  const counts = new Map<string, number>();
  for (const car of snapshot.cars) {
    const manufacturer = car.Manufacturer || '';
    counts.set(manufacturer, (counts.get(manufacturer) || 0) + 1);
  }

  return {
    brands: brands
      .map(brand => ({ ...brand, count: counts.get(brand.nameKo) || 0 }))
      .filter(brand => brand.count > 0)
      .sort((a, b) => b.count - a.count),
    total: snapshot.cars.length,
    source: 'snapshot' as const,
    snapshotGeneratedAt: snapshot.generatedAt,
  };
}

export function getSnapshotModelData(brand: string, model?: string, variant?: string) {
  const brandCars = snapshot.cars.filter(car => matchesBrand(car, brand));
  const modelCars = model ? brandCars.filter(car => matchesModel(car, model)) : brandCars;
  const cars = variant ? modelCars.filter(car => car.Model === variant) : modelCars;

  if (variant && model) {
    const badgeCounts = new Map<string, number>();
    const detailCounts = new Map<string, Map<string, number>>();
    const tree = new Map<string, Map<string, number>>();

    for (const car of cars) {
      const badge = car.Badge || '';
      if (!badge) continue;
      badgeCounts.set(badge, (badgeCounts.get(badge) || 0) + 1);
      const detail = car.BadgeDetail || '';
      if (detail) {
        if (!detailCounts.has(badge)) detailCounts.set(badge, new Map());
        const details = detailCounts.get(badge)!;
        details.set(detail, (details.get(detail) || 0) + 1);
      }
      const fuel = car.FuelType || '';
      const drivetrainMatch = badge.match(/(?:^|\s)(2WD|4WD|AWD)(?:\s|$)/i);
      const groupKey = `${fuel}|${drivetrainMatch?.[1]?.toUpperCase() || ''}`;
      if (!tree.has(groupKey)) tree.set(groupKey, new Map());
      const group = tree.get(groupKey)!;
      group.set(badge, (group.get(badge) || 0) + 1);
    }

    const badgeDetailsFor = (badge: string) => Array.from(detailCounts.get(badge)?.entries() || [])
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const badges = Array.from(badgeCounts.entries())
      .map(([name, count]) => ({ name, count, badgeDetails: badgeDetailsFor(name) }))
      .sort((a, b) => b.count - a.count);

    const badgeTree = Array.from(tree.entries())
      .map(([key, group]) => {
        const [fuel, drivetrain] = key.split('|');
        const groupBadges = Array.from(group.entries())
          .map(([name, count]) => ({ name, count, badgeDetails: badgeDetailsFor(name) }))
          .sort((a, b) => b.count - a.count);
        return {
          fuel,
          drivetrain,
          count: groupBadges.reduce((sum, badge) => sum + badge.count, 0),
          badges: groupBadges,
        };
      })
      .sort((a, b) => b.count - a.count);

    return { badges, badgeTree, total: cars.length, source: 'snapshot' as const };
  }

  if (model) {
    const variants = new Map<string, { count: number; yearFrom: number; yearTo: number }>();
    for (const car of cars) {
      const name = car.Model || '';
      if (!name) continue;
      const year = getYear(car);
      const current = variants.get(name);
      if (current) {
        current.count++;
        current.yearFrom = Math.min(current.yearFrom, year || current.yearFrom);
        current.yearTo = Math.max(current.yearTo, year);
      } else {
        variants.set(name, { count: 1, yearFrom: year || 0, yearTo: year || 0 });
      }
    }
    return {
      models: Array.from(variants.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.yearTo - a.yearTo || b.count - a.count),
      total: cars.length,
      source: 'snapshot' as const,
    };
  }

  const groups = new Map<string, { count: number; nameKo: string }>();
  for (const car of cars) {
    const base = getBaseModelName(car.Model || '');
    if (!base) continue;
    const name = translateModel(base);
    const current = groups.get(name);
    if (current) current.count++;
    else groups.set(name, { count: 1, nameKo: base });
  }

  return {
    models: Array.from(groups.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count),
    total: brandCars.length,
    source: 'snapshot' as const,
  };
}
