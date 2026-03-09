export interface CarListing {
  id: string;
  source: 'encar' | 'own';
  brand: string;
  model: string;
  generation?: string;
  trim?: string;
  year: number;
  month?: number;
  mileage: number;
  fuel: string;
  engine: string;
  hp?: number;
  color?: string;
  bodyType?: string;
  transmission?: string;
  drivetrain?: string;
  price_krw: number;
  price_rub: number;
  price_usd?: number;
  price_turnkey_russia?: number;    // server-calculated turnkey price in RUB
  price_turnkey_tajikistan?: number; // server-calculated turnkey price in RUB
  imageUrl: string;
  images: string[];
  photoCount?: number;
  description?: string;
  equipment?: string[];
  vin?: string;
  accidentHistory?: AccidentRecord[];
  inspectionData?: InspectionData;
  displacement?: number;
  seatCount?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface AccidentRecord {
  date: string;
  type: string;
  amount: string;
  description?: string;
}

// Damage types from Encar inspection page
export type DamageType = 'CHANGE' | 'METAL' | 'CORROSION' | 'SCRATCH' | 'HILLS' | 'DAMAGE';

export interface PanelDamage {
  name: string;        // English panel name (e.g., 'hood', 'frontDoorLeft')
  nameRu: string;      // Russian translation
  rank: string;        // Severity rank: '1', '2', 'A', 'B', 'C'
  damages: DamageType[]; // List of damage types on this panel
}

export interface InspectionData {
  panels: PanelDamage[];
  summary: {
    change: number;    // 교환 (Replacement)
    metal: number;     // 판금/용접 (Sheet metal/Welding)
    corrosion: number; // 부식 (Corrosion)
    scratch: number;   // 흠집 (Scratch)
    dent: number;      // 요철 (Dent)
    damage: number;    // 손상 (Damage)
  };
  hasDamage: boolean;
  accidentHistory?: boolean; // 사고이력 있음/없음
  simpleRepair?: boolean;    // 단순수리 있음/없음
}

export interface CarFilters {
  brand?: string;
  model?: string;
  modelVariant?: string;
  badge?: string;
  yearFrom?: number;
  yearTo?: number;
  monthFrom?: number;
  monthTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuel?: string;
  bodyType?: string;
  mileageFrom?: number;
  mileageTo?: number;
  transmission?: string;
  drivetrain?: string;
  color?: string;
  options?: string[];
  sort?: 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'mileage_asc' | 'mileage_desc';
  page?: number;
  limit?: number;
  search?: string;
}

export interface PriceBreakdownData {
  carPrice: number;
  customsDuty: number;
  customsDutyDetails?: string; // e.g., "2.7 EUR × 1999 cc"
  customsFee: number; // таможенный сбор за оформление
  utilizationFee: number;
  utilizationWarning?: string; // warning for >160 HP cars
  serviceFee: number; // $1,600 converted to RUB
  serviceFeeUsd: number; // raw USD amount
  brokerFee: number; // 100,000 RUB
  total: number;
  currency: 'RUB' | 'USD';
}

export interface SiteSettings {
  serviceFeeUsd: number; // $1,600 default
  brokerFee: number; // 100,000 RUB default
  contactPhone: string;
  contactTelegram: string;
  contactWhatsApp: string;
  aboutText: string;
  exchangeRateMarkup: number;
}

export interface ContactMessage {
  _id?: string;
  name: string;
  phone: string;
  messenger: 'telegram' | 'whatsapp' | 'phone';
  message: string;
  carId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CatalogResponse {
  cars: CarListing[];
  total: number;
  page: number;
  totalPages: number;
}
