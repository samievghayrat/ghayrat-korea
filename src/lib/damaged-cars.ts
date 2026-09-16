export type DamageCategory = 'transfer' | 'scrap' | 'transfer-scrap' | 'unknown';
export type DamageLoss = 'partial' | 'total' | 'unknown';
export type DamageArea = 'front' | 'rear' | 'left' | 'right' | 'roof' | 'underbody';
export interface DamagedCarSummary {
  id: string; brand: string; model: string; title: string; lotNumber: string;
  registrationDate: string | null; year: number | null; mileage: number | null;
  fuel: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'lpg' | 'unknown';
  transmission: 'automatic' | 'manual' | 'unknown';
  category: DamageCategory; lossType: DamageLoss; closesAt: string | null; image: string | null;
}
export interface DamagedCar extends DamagedCarSummary {
  manufacturedYear: number | null;
  images: string[]; displacement: number | null; registeredMileage: number | null;
  mileageUnverified: boolean; engineCode: string | null; vin: string | null;
  storageFeeKrw: number | null; priceKrw: number | null;
  damageAreas: DamageArea[]; damageNotes: string[]; airbagsDeployed: boolean | null; fetchedAt: string;
}
export interface DamagedCatalogue {
  cars: DamagedCarSummary[]; fetchedAt: string; fallback: boolean;
}
export interface DamagedSnapshot { cars: DamagedCar[]; fetchedAt: string; count: number }

// Deliberate allowlist: catalogue responses never contain private source responses,
// source descriptions, cookies, account information or all gallery URLs.
export function summarizeDamagedCar(car: DamagedCarSummary): DamagedCarSummary {
  const { id, brand, model, title, lotNumber, registrationDate, year, mileage, fuel, transmission,
    category, lossType, closesAt, image } = car;
  return { id, brand, model, title, lotNumber, registrationDate, year, mileage, fuel, transmission,
    category, lossType, closesAt, image };
}

export function isDamagedAuctionClosed(car: Pick<DamagedCarSummary, 'closesAt'>, now = Date.now()) {
  return Boolean(car.closesAt && Date.parse(car.closesAt) <= now);
}

export function filterDamagedCars(cars: DamagedCarSummary[], filters: {
  brand?: string; model?: string; yearFrom?: number; category?: string; lossType?: string; query?: string;
}) {
  const query = (filters.query || '').trim().toLowerCase();
  return cars.filter(car => (!filters.brand || car.brand === filters.brand)
    && (!filters.model || car.model === filters.model)
    && (!filters.yearFrom || (car.year !== null && car.year >= filters.yearFrom))
    && (!filters.category || car.category === filters.category)
    && (!filters.lossType || car.lossType === filters.lossType)
    && (!query || `${car.title} ${car.lotNumber} ${car.id}`.toLowerCase().includes(query)))
    .sort((a, b) => {
      const aClosed = isDamagedAuctionClosed(a), bClosed = isDamagedAuctionClosed(b);
      if (aClosed !== bClosed) return aClosed ? 1 : -1;
      return Number(b.id) - Number(a.id);
    });
}
