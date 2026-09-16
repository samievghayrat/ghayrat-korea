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

export type DamagedAuctionType = 'transfer' | 'scrap';
export interface DamagedBidCalculation {
  bidKrw: number;
  auctionFeeKrw: number;
  vatKrw: number;
  processingFeeKrw: number;
  totalKrw: number;
}

// Current auction tariff verified from the source calculator on 2026-09-16.
// Bids are entered in KRW and must use 10,000-won increments.
export function calculateDamagedAuctionBid(bidKrw: number, auctionType: DamagedAuctionType): DamagedBidCalculation {
  const bid = Number.isFinite(bidKrw) ? Math.max(0, Math.floor(bidKrw)) : 0;
  if (!bid) return { bidKrw: 0, auctionFeeKrw: 0, vatKrw: 0, processingFeeKrw: 0, totalKrw: 0 };

  const auctionFeeKrw = bid < 10_000
    ? 0
    : bid < 1_000_000
      ? 50_000
      : Math.min(Math.floor(bid * 0.055), 3_000_000);
  const vatKrw = auctionType === 'scrap' ? Math.floor(bid * 0.1) : 0;
  const processingFeeKrw = auctionType === 'scrap'
    ? 100_000
    : bid < 10_000
      ? 0
      : bid < 5_000_000
        ? 200_000
        : bid < 30_000_000
          ? 300_000
          : 400_000;

  return {
    bidKrw: bid,
    auctionFeeKrw,
    vatKrw,
    processingFeeKrw,
    totalKrw: bid + auctionFeeKrw + vatKrw + processingFeeKrw,
  };
}

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
