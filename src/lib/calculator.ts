import type { PriceBreakdownData } from '@/types';
import { EXCHANGE_RATES } from './constants';

interface CalcInput {
  priceKrw: number;
  priceRub: number;
  displacement: number; // in cc
  year: number;
  month?: number;
  fuel: string;
  hp?: number;
  destination?: 'russia' | 'tajikistan';
}

// --- tks.ru customs duty rate tables ---

// Cars under 3 years old: percentage of EUR price, with minimum EUR/cc floor
const UNDER_3_RATES = [
  { maxEur: 8500, pct: 0.54, minPerCc: 2.5 },
  { maxEur: 16700, pct: 0.48, minPerCc: 3.5 },
  { maxEur: 42300, pct: 0.48, minPerCc: 5.5 },
  { maxEur: 84500, pct: 0.48, minPerCc: 7.5 },
  { maxEur: 169000, pct: 0.48, minPerCc: 15.0 },
  { maxEur: Infinity, pct: 0.48, minPerCc: 20.0 },
];

// Cars 3-5 years old: flat EUR/cc
const YEARS_3_5_RATES = [
  { maxCc: 1000, eurPerCc: 1.5 },
  { maxCc: 1500, eurPerCc: 1.7 },
  { maxCc: 1800, eurPerCc: 2.5 },
  { maxCc: 2300, eurPerCc: 2.7 },
  { maxCc: 3000, eurPerCc: 3.0 },
  { maxCc: Infinity, eurPerCc: 3.6 },
];

// Cars over 5 years old: flat EUR/cc
const OVER_5_RATES = [
  { maxCc: 1000, eurPerCc: 3.0 },
  { maxCc: 1500, eurPerCc: 3.2 },
  { maxCc: 1800, eurPerCc: 3.5 },
  { maxCc: 2300, eurPerCc: 4.8 },
  { maxCc: 3000, eurPerCc: 5.0 },
  { maxCc: Infinity, eurPerCc: 5.7 },
];

// --- Utilization fee tables (Постановление No 1713, from Dec 1 2025) ---
// Base rate: 20,000 RUB × coefficient
// Format: [maxHp, coeffNew, coeffOld]

const UTIL_BASE = 20000;
type UtilCoeff = [number, number, number];

// Electric / sequential hybrid
const UTIL_ELECTRIC: UtilCoeff[] = [
  [80, 0.17, 0.26],
  [100, 49.56, 82.08],
  [130, 65.88, 95.64],
  [160, 78.00, 111.36],
  [190, 92.40, 129.72],
  [220, 109.68, 151.20],
  [250, 129.96, 176.16],
  [280, 153.96, 205.20],
  [Infinity, 182.40, 239.04],
];

// Engine under 1.0L (same structure as 1.0-2.0L for >160HP)
const UTIL_UNDER_1L: UtilCoeff[] = [
  [160, 0.17, 0.26],
  [190, 15.36, 28.43],
  [Infinity, 45.00, 74.64],
];

// Engine 1.0-2.0L
const UTIL_1_2L: UtilCoeff[] = [
  [160, 0.17, 0.26],
  [190, 45.00, 74.64],
  [220, 47.64, 79.20],
  [250, 50.52, 83.88],
  [280, 57.12, 91.92],
  [310, 64.56, 100.56],
  [340, 72.96, 110.16],
  [370, 83.16, 120.60],
  [400, 94.80, 132.00],
  [430, 108.00, 144.60],
  [460, 123.24, 158.40],
  [500, 140.40, 173.40],
  [Infinity, 160.08, 189.84],
];

// Engine 2.0-3.0L
const UTIL_2_3L: UtilCoeff[] = [
  [160, 0.17, 0.26],
  [190, 115.34, 172.80],
  [220, 118.20, 175.08],
  [250, 120.12, 177.60],
  [280, 126.00, 183.00],
  [310, 131.04, 188.52],
  [340, 136.32, 193.68],
  [370, 141.72, 199.08],
  [400, 147.48, 204.72],
  [430, 153.36, 210.48],
  [460, 159.48, 216.36],
  [500, 165.84, 222.36],
  [Infinity, 172.44, 228.60],
];

// Engine 3.0-3.5L (commercial rates, no preferential)
const UTIL_3_35L: UtilCoeff[] = [
  [160, 129.20, 197.81],
  [190, 131.76, 200.04],
  [220, 134.40, 202.20],
  [250, 137.16, 204.36],
  [280, 140.52, 207.24],
  [310, 144.00, 212.40],
  [340, 151.92, 217.80],
  [370, 160.32, 224.28],
  [400, 169.20, 231.00],
  [430, 178.44, 237.96],
  [460, 188.28, 245.04],
  [500, 198.60, 252.48],
  [Infinity, 209.52, 260.04],
];

// Engine over 3.5L (commercial rates, no preferential)
const UTIL_35L_PLUS: UtilCoeff[] = [
  [160, 164.53, 216.29],
  [190, 167.28, 219.48],
  [220, 170.16, 222.84],
  [250, 173.04, 226.20],
  [280, 176.52, 231.36],
  [310, 180.00, 236.64],
  [340, 186.36, 249.60],
  [370, 192.88, 263.40],
  [400, 199.68, 277.92],
  [430, 206.64, 293.16],
  [460, 213.84, 309.36],
  [500, 221.28, 326.40],
  [Infinity, 229.08, 344.28],
];

// Customs processing fee (таможенный сбор за таможенное оформление) — 2026 rates
function calculateCustomsFee(valueRub: number): number {
  if (valueRub <= 200000) return 1231;
  if (valueRub <= 450000) return 2462;
  if (valueRub <= 1200000) return 4924;
  if (valueRub <= 2700000) return 13541;
  if (valueRub <= 4200000) return 18465;
  if (valueRub <= 5500000) return 21344;
  if (valueRub <= 7000000) return 49240;
  if (valueRub <= 10000000) return 49240;
  return 73860;
}

function getCarAgeYears(year: number, month?: number): number {
  const now = new Date();
  const carDate = new Date(year, (month || 1) - 1);
  return (now.getTime() - carDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

function calculateCustomsDutyEur(
  priceEur: number,
  displacement: number,
  ageYears: number,
  isElectric: boolean,
): { dutyEur: number; details: string } {
  if (isElectric) {
    const duty = priceEur * 0.15;
    return { dutyEur: duty, details: '15% от стоимости (электро)' };
  }

  if (ageYears < 3) {
    const bracket = UNDER_3_RATES.find((r) => priceEur <= r.maxEur)!;
    const pctDuty = priceEur * bracket.pct;
    const minDuty = displacement * bracket.minPerCc;
    const duty = Math.max(pctDuty, minDuty);
    if (duty === minDuty) {
      return {
        dutyEur: duty,
        details: `${bracket.minPerCc} EUR/cc × ${displacement} cc`,
      };
    }
    return {
      dutyEur: duty,
      details: `${(bracket.pct * 100).toFixed(0)}% от ${Math.round(priceEur).toLocaleString('ru-RU')} EUR`,
    };
  }

  if (ageYears < 5) {
    const bracket = YEARS_3_5_RATES.find((r) => displacement <= r.maxCc)!;
    const duty = displacement * bracket.eurPerCc;
    return {
      dutyEur: duty,
      details: `${bracket.eurPerCc} EUR/cc × ${displacement} cc (3-5 лет)`,
    };
  }

  // Over 5 years
  const bracket = OVER_5_RATES.find((r) => displacement <= r.maxCc)!;
  const duty = displacement * bracket.eurPerCc;
  return {
    dutyEur: duty,
    details: `${bracket.eurPerCc} EUR/cc × ${displacement} cc (>5 лет)`,
  };
}

function calculateUtilizationFee(
  displacement: number,
  hp: number,
  ageYears: number,
  isElectric: boolean,
): { fee: number; details: string } {
  let table: UtilCoeff[];

  if (isElectric) {
    table = UTIL_ELECTRIC;
  } else if (displacement <= 1000) {
    table = UTIL_UNDER_1L;
  } else if (displacement <= 2000) {
    table = UTIL_1_2L;
  } else if (displacement <= 3000) {
    table = UTIL_2_3L;
  } else if (displacement <= 3500) {
    table = UTIL_3_35L;
  } else {
    table = UTIL_35L_PLUS;
  }

  const isNew = ageYears < 3;
  const bracket = table.find(([maxHp]) => hp <= maxHp)!;
  const coeff = isNew ? bracket[1] : bracket[2];
  const fee = Math.round(UTIL_BASE * coeff);

  const details =
    coeff <= 0.26
      ? `${UTIL_BASE.toLocaleString('ru-RU')} × ${coeff}`
      : `${UTIL_BASE.toLocaleString('ru-RU')} × ${coeff} (${hp} л.с.)`;

  return { fee, details };
}

export function calculateImportCost(input: CalcInput): PriceBreakdownData {
  const eurToRub = EXCHANGE_RATES.EUR;
  const usdToRub = EXCHANGE_RATES.USD;
  const destination = input.destination || 'russia';

  const fuelLower = input.fuel.toLowerCase();
  const isElectric =
    fuelLower.includes('электро') ||
    fuelLower.includes('electric');
  const isHybrid =
    fuelLower.includes('гибрид') ||
    fuelLower.includes('hybrid');

  // 1. Car price in RUB
  const carPrice = input.priceRub;

  if (destination === 'tajikistan') {
    // Tajikistan: no customs, no util, no broker — just $3,000 shipping
    const serviceFeeUsd = 3000;
    const serviceFee = Math.round(serviceFeeUsd * usdToRub);
    const total = carPrice + serviceFee;

    return {
      carPrice,
      customsDuty: 0,
      customsFee: 0,
      utilizationFee: 0,
      serviceFee,
      serviceFeeUsd,
      brokerFee: 0,
      total,
      currency: 'RUB',
    };
  }

  // Russia (default)
  // Convert to EUR for customs calculation
  const priceEur = carPrice / eurToRub;

  // Car age
  const ageYears = getCarAgeYears(input.year, input.month);

  // 2. Customs duty (единый таможенный платёж для физлиц)
  const { dutyEur, details: customsDutyDetails } = calculateCustomsDutyEur(
    priceEur,
    input.displacement,
    ageYears,
    isElectric,
  );
  const customsDuty = Math.round(dutyEur * eurToRub) + 20000;

  // 3. Customs processing fee (таможенный сбор за оформление)
  const customsFee = calculateCustomsFee(carPrice);

  // 4. Utilization fee (Постановление No 1713)
  // For hybrids, Russian customs uses combined system power (engine + electric motor).
  // Typical Korean hybrid electric motors add ~40-50hp to the engine output.
  const engineHp = input.hp || 0;
  const hp = isHybrid ? Math.round(engineHp * 1.3) : engineHp;
  const { fee: utilizationFee, details: utilizationWarning } =
    calculateUtilizationFee(input.displacement, hp, ageYears, isElectric);

  // 5. Service fee: $1,600 (shipping Korea→Vladivostok + company services)
  const serviceFeeUsd = 1600;
  const serviceFee = Math.round(serviceFeeUsd * usdToRub);

  // 6. Broker fee: 100,000 RUB
  const brokerFee = 100000;

  const total = carPrice + customsDuty + customsFee + utilizationFee + serviceFee + brokerFee;

  return {
    carPrice,
    customsDuty,
    customsDutyDetails,
    customsFee,
    utilizationFee,
    utilizationWarning,
    serviceFee,
    serviceFeeUsd,
    brokerFee,
    total,
    currency: 'RUB',
  };
}
