import { translateBrand, translateModel, translateFuel, translateColor, translateBadgeDetail, reverseTranslateBrand, reverseTranslateModel } from './translations';
import { convertKrwToRub, convertKrwToUsd, getEurToRub, getUsdToRub } from './currency';
import { calculateImportCost } from './calculator';
import type { CarListing, CarFilters, CatalogResponse, InspectionData, PanelDamage, DamageType } from '@/types';
import { HP_DATA, ENGINE_FALLBACK } from '@/data/hp-data';
import { getSnapshotCarById, getSnapshotSearch } from './encar-snapshot';
import { ENCAR_API_BASE, ENCAR_INSPECTION_BASE, ENCAR_READSIDE_BASE } from './encar-endpoints';
import { getPanAutoVehicleReference } from './pan-auto';

const ENCAR_IMAGE_CDN = 'https://ci.encar.com';
const ENCAR_OPTIONS_API = `${ENCAR_READSIDE_BASE}/vehicles/car/options/standard`;
const NORMAL_SELL_TYPE = '\uC77C\uBC18'; // 일반: normal sale, excludes lease/rent listings

function getEncarDisplayImageUrl(path: string, width: number, height: number): string {
  const imagePath = path.endsWith('_') ? `${path}001.jpg` : path;
  const canonicalPath = imagePath.startsWith('/carpicture/')
    ? imagePath
    : `/carpicture${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  const params = new URLSearchParams({
    impolicy: 'heightRate',
    rh: String(height),
    cw: String(width),
    ch: String(height),
    cg: 'Center',
    wtmk: `${ENCAR_IMAGE_CDN}/wt_mark/w_mark_04.png`,
  });

  return `${ENCAR_IMAGE_CDN}${canonicalPath}?${params.toString()}`;
}

const transmissionMap: Record<string, string> = {
  '오토': 'Автомат',
  '수동': 'Механика',
  'CVT': 'Вариатор (CVT)',
  'DCT': 'Робот (DCT)',
  '자동': 'Автомат',
  '세미오토': 'Полуавтомат',
};

const drivetrainMap: Record<string, string> = {
  '2WD': '2WD',
  'FF': 'Передний привод',
  '전륜구동': 'Передний привод',
  '후륜구동': 'Задний привод',
  'FR': 'Задний привод',
  '4WD': 'Полный привод (4WD)',
  'AWD': 'Полный привод (AWD)',
  '4륜구동': 'Полный привод (4WD)',
};

function translateTransmission(korean: string): string {
  if (!korean) return korean;
  return transmissionMap[korean] || korean;
}

// Fetch exact HP and displacement from NHTSA VIN Decoder API
interface VinData {
  hp?: number;
  displacement?: number;
}

async function fetchDataFromVin(vin: string): Promise<VinData> {
  if (!vin || vin.length < 11) return {};
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${encodeURIComponent(vin)}?format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const results = data.Results as { VariableId: number; Variable: string; Value: string | null }[];
    if (!results) return {};

    const result: VinData = {};

    // HP: VariableId 71 = EngineKW, VariableId 228 = EngineBrakeHP
    const hpEntry = results.find(r => r.Variable === 'Engine Brake (hp) From' || r.VariableId === 228);
    if (hpEntry?.Value) {
      const hp = parseFloat(hpEntry.Value);
      if (hp > 0) result.hp = Math.round(hp);
    }
    if (!result.hp) {
      const kwEntry = results.find(r => r.Variable === 'Engine Power (kW)' || r.VariableId === 71);
      if (kwEntry?.Value) {
        const kw = parseFloat(kwEntry.Value);
        if (kw > 0) result.hp = Math.round(kw * 1.341);
      }
    }

    // Displacement: VariableId 13 = Displacement (cc), 11 = Displacement (L)
    const ccEntry = results.find(r => r.Variable === 'Displacement (CC)' || r.VariableId === 13);
    if (ccEntry?.Value) {
      const cc = parseFloat(ccEntry.Value);
      if (cc > 0) result.displacement = Math.round(cc);
    }
    if (!result.displacement) {
      const lEntry = results.find(r => r.Variable === 'Displacement (L)' || r.VariableId === 11);
      if (lEntry?.Value) {
        const l = parseFloat(lEntry.Value);
        if (l > 0) result.displacement = Math.round(l * 1000);
      }
    }

    return result;
  } catch {
    return {};
  }
}

// Strip generation info from Korean model name to get base model
// e.g. "K3 2세대" → "K3", "쏘렌토 4세대" → "쏘렌토", "모닝 (JA)" → "모닝"
// e.g. "더 뉴 K5" → "K5", "올 뉴 투싼" → "투싼"
// e.g. "그랜저 HG" → "그랜저", "투싼 NX4" → "투싼"
function getBaseModelName(model: string): string {
  let base = model;
  // Strip generation prefixes
  const prefixes = ['디 올 뉴 ', '더 뉴 ', '올 뉴 ', '더뉴 ', '올뉴 ', '뉴 '];
  for (const p of prefixes) {
    if (base.startsWith(p)) { base = base.slice(p.length); break; }
  }
  // Strip generation suffixes: "N세대", "(XX)", "(신형)", "(구형)"
  base = base.replace(/\s*\d+세대.*$/, '');
  base = base.replace(/\s*\([^)]*\)\s*$/, '');
  base = base.replace(/\s*(신형|구형)$/, '');
  // Strip " Hybrid", " 하이브리드" etc. since fuel type is separate
  base = base.replace(/\s*(Hybrid|하이브리드|EV|전기|PHEV)$/i, '');
  // Strip Encar generation/chassis codes: "그랜저 HG" → "그랜저", "투싼 NX4" → "투싼"
  // Only strip if the base model starts with Korean chars (so we don't strip from "K5", "GV70" etc.)
  base = base.replace(/^([가-힣]+(?:\s[가-힣]+)*)\s+[A-Za-z0-9]{2,}$/, '$1');
  return base.trim();
}

// Generate model name variants to try for lookup (most specific → least specific)
function getModelVariants(model: string): string[] {
  const variants = [model];
  const base = getBaseModelName(model);
  if (base !== model) variants.push(base);
  // Also try stripping the last word if it looks like a generation code
  // e.g. "그랜저 HG 240" → "그랜저 HG" → "그랜저"
  const words = model.split(/\s+/);
  for (let i = words.length - 1; i >= 1; i--) {
    const shorter = words.slice(0, i).join(' ');
    if (!variants.includes(shorter)) variants.push(shorter);
    const shorterBase = getBaseModelName(shorter);
    if (shorterBase !== shorter && !variants.includes(shorterBase)) variants.push(shorterBase);
  }
  return variants;
}

// Try multiple displacement values to account for rounding (e.g. 2500 vs 2497)
function getDisplacementVariants(displacement: number): number[] {
  if (!displacement) return [0];
  const variants = [displacement];
  // Try ±10cc for rounding differences (e.g. Encar returns 2500, actual is 2497)
  for (let delta = -10; delta <= 10; delta++) {
    if (delta !== 0) variants.push(displacement + delta);
  }
  return variants;
}

function translateDrivetrain(value: string): string {
  if (!value) return value;
  return drivetrainMap[value] || value;
}

// Encar sometimes appends eligibility notes to the fuel value, for example
// "LPG(일반인 구입)". Engine reference keys use the shorter canonical names.
function getFuelLookupVariants(fuel: string): string[] {
  const variants = [fuel];
  const lower = fuel.toLowerCase();

  if (lower.includes('lpg')) variants.push('LPG');
  if (fuel.includes('가솔린+전기')) variants.push('가솔린+전기', '하이브리드');
  if (fuel.includes('디젤+전기')) variants.push('디젤+전기', '하이브리드');
  if (fuel.includes('가솔린')) variants.push('가솔린');
  if (fuel.includes('디젤')) variants.push('디젤');
  if (fuel.includes('전기')) variants.push('전기');

  return Array.from(new Set(variants.filter(Boolean)));
}

// Many snapshot listings omit engine volume but include it in the badge
// (for example, "2.0 TDI" or "3.3 GDI"). Restrict the parser to a decimal
// litre value so model names such as 520d are never mistaken for engine size.
function parseDisplacementFromBadge(badge: string): number | undefined {
  const match = badge.match(/(?:^|\s)([0-6]\.\d{1,2})(?=\s|$)/);
  if (!match) return undefined;
  const litres = Number.parseFloat(match[1]);
  return litres > 0 ? Math.round(litres * 1000) : undefined;
}

interface EngineVariantRule {
  brand: RegExp;
  model: RegExp;
  badge?: RegExp;
  fuel: string;
  hp: number;
  cc: number;
  yearFrom?: number;
  yearTo?: number;
}

// Curated specifications supplied by the business for common Russia-friendly
// Korean-market variants. Badge matching is deliberately used where one model
// name can contain several engines with very different utilization fees.
const CURATED_ENGINE_VARIANTS: EngineVariantRule[] = [
  // BMW
  { brand: /^BMW$/i, model: /1시리즈/, badge: /118i/i, fuel: '가솔린', hp: 140, cc: 1499 },
  { brand: /^BMW$/i, model: /1시리즈/, badge: /116d/i, fuel: '디젤', hp: 116, cc: 1995 },
  { brand: /^BMW$/i, model: /1시리즈/, badge: /118d/i, fuel: '디젤', hp: 150, cc: 1995 },
  { brand: /^BMW$/i, model: /^X1\b/, badge: /18d/i, fuel: '디젤', hp: 150, cc: 1995 },
  { brand: /^BMW$/i, model: /2시리즈 그란쿠페/, badge: /218d/i, fuel: '디젤', hp: 150, cc: 1995 },

  // MINI
  { brand: /^미니$/, model: /^쿠퍼(?!\s+(?:S|D|SD|일렉트릭))(?:\s|$)/i, fuel: '가솔린', hp: 136, cc: 1499 },
  { brand: /^미니$/, model: /쿠퍼|미니/, badge: /\bOne\b/i, fuel: '가솔린', hp: 102, cc: 1499 },

  // Mercedes-Benz
  { brand: /^(?:벤츠|메르세데스벤츠)$/, model: /A-클래스/, badge: /A\s?180(?!.*CDI)/i, fuel: '가솔린', hp: 136, cc: 1332 },
  { brand: /^(?:벤츠|메르세데스벤츠)$/, model: /GLB-클래스/, badge: /GLB\s?200\s*d/i, fuel: '디젤', hp: 150, cc: 1950 },

  // Audi
  { brand: /^아우디$/, model: /^A7\b/, badge: /3\.0 TFSI/i, fuel: '가솔린', hp: 310, cc: 2995, yearTo: 2014 },
  { brand: /^아우디$/, model: /^Q2\b/, badge: /35 TFSI/i, fuel: '가솔린', hp: 150, cc: 1395 },
  { brand: /^아우디$/, model: /^(?:뉴 )?A3\b/, badge: /35 TFSI/i, fuel: '가솔린', hp: 150, cc: 1395 },
  { brand: /^아우디$/, model: /^Q3\b/, badge: /35 TDI/i, fuel: '디젤', hp: 150, cc: 1968 },

  // Volkswagen
  { brand: /^폭스바겐$/, model: /제타/, badge: /1\.4 TSI/i, fuel: '가솔린', hp: 150, cc: 1395 },
  { brand: /^폭스바겐$/, model: /티구안/, badge: /2\.0 TDI/i, fuel: '디젤', hp: 150, cc: 1968 },
  { brand: /^폭스바겐$/, model: /티록/, badge: /2\.0 TDI/i, fuel: '디젤', hp: 150, cc: 1968 },

  // Peugeot
  { brand: /^푸조$/, model: /^2008\b/, badge: /1\.2/i, fuel: '가솔린', hp: 130, cc: 1199 },
  { brand: /^푸조$/, model: /^3008\b/, badge: /1\.5 BlueHDi/i, fuel: '디젤', hp: 130, cc: 1499 },
  { brand: /^푸조$/, model: /^508(?:\s|$)/, badge: /1\.5 BlueHDi/i, fuel: '디젤', hp: 130, cc: 1499 },

  // Renault Korea / Renault Samsung
  { brand: /^(?:르노삼성|르노코리아\(삼성\))$/, model: /XM3/, badge: /1\.3/i, fuel: '가솔린', hp: 152, cc: 1332 },
  { brand: /^(?:르노삼성|르노코리아\(삼성\))$/, model: /XM3/, badge: /1\.6/i, fuel: '가솔린', hp: 123, cc: 1598 },
  { brand: /^(?:르노삼성|르노코리아\(삼성\))$/, model: /QM6/, fuel: '가솔린', hp: 144, cc: 1997 },
  { brand: /^(?:르노삼성|르노코리아\(삼성\))$/, model: /SM6/, badge: /1\.5/i, fuel: '가솔린', hp: 156, cc: 1497 },
  { brand: /^(?:르노삼성|르노코리아\(삼성\))$/, model: /SM6/, badge: /2\.0/i, fuel: '가솔린', hp: 140, cc: 1997 },

  // Hyundai
  { brand: /^현대$/, model: /아반떼/, badge: /1\.6|HEV/i, fuel: '가솔린+전기', hp: 141, cc: 1580 },
  { brand: /^현대$/, model: /아반떼/, badge: /1\.6|GDI|VVT/i, fuel: '가솔린', hp: 123, cc: 1598 },
  { brand: /^현대$/, model: /베뉴/, fuel: '가솔린', hp: 123, cc: 1598 },
  { brand: /^현대$/, model: /코나/, badge: /2\.0/i, fuel: '가솔린', hp: 149, cc: 1999 },
  { brand: /^현대$/, model: /코나.*하이브리드/, fuel: '가솔린+전기', hp: 141, cc: 1580 },
  { brand: /^현대$/, model: /쏘나타/, badge: /2\.0/i, fuel: '가솔린', hp: 160, cc: 1999 },
  { brand: /^현대$/, model: /쏘나타/, fuel: 'LPG', hp: 146, cc: 1999 },

  // Kia
  { brand: /^기아$/, model: /K3/, badge: /1\.6|GDI/i, fuel: '가솔린', hp: 123, cc: 1598 },
  { brand: /^기아$/, model: /K5/, badge: /2\.0/i, fuel: '가솔린', hp: 160, cc: 1999 },
  { brand: /^기아$/, model: /K5/, fuel: 'LPG', hp: 146, cc: 1999 },
  { brand: /^기아$/, model: /셀토스/, badge: /1\.6/i, fuel: '디젤', hp: 136, cc: 1598 },
  { brand: /^기아$/, model: /니로(?!.*EV)/, fuel: '가솔린+전기', hp: 141, cc: 1580 },
  { brand: /^기아$/, model: /스포티지 5세대/, fuel: 'LPG', hp: 146, cc: 1999 },

  // KGM / SsangYong
  { brand: /^(?:쌍용|KG모빌리티\(쌍용\))$/, model: /티볼리/, badge: /1\.6|VX|IX|RX/i, fuel: '가솔린', hp: 128, cc: 1597 },
  { brand: /^(?:쌍용|KG모빌리티\(쌍용\))$/, model: /코란도(?!.*(?:스포츠|투리스모))/, fuel: '디젤', hp: 136, cc: 1598, yearFrom: 2020, yearTo: 2023 },

  // Chevrolet
  { brand: /^쉐보레(?:\(GM대우\))?$/, model: /트레일블레이저/, badge: /1\.2/i, fuel: '가솔린', hp: 139, cc: 1199 },
  { brand: /^쉐보레(?:\(GM대우\))?$/, model: /트레일블레이저/, badge: /1\.3/i, fuel: '가솔린', hp: 156, cc: 1341 },
  { brand: /^쉐보레(?:\(GM대우\))?$/, model: /말리부/, badge: /1\.35/i, fuel: '가솔린', hp: 156, cc: 1341 },
];

function lookupCuratedEngine(
  brand: string,
  model: string,
  badge: string,
  fuel: string,
  year?: number,
): { hp: number; cc: number } | undefined {
  const fuels = getFuelLookupVariants(fuel);
  const rule = CURATED_ENGINE_VARIANTS.find((candidate) =>
    candidate.brand.test(brand)
    && candidate.model.test(model)
    && (!candidate.badge || candidate.badge.test(badge))
    && fuels.includes(candidate.fuel)
    && (!candidate.yearFrom || (year || 0) >= candidate.yearFrom)
    && (!candidate.yearTo || (year || Number.MAX_SAFE_INTEGER) <= candidate.yearTo)
  );
  return rule ? { hp: rule.hp, cc: rule.cc } : undefined;
}

// Look up HP and displacement from local data
// Returns { hp, cc } — cc is only set if we inferred it (displacement was 0)
function lookupEngine(
  brand: string,
  model: string,
  displacement: number,
  fuel: string,
  badge = '',
  year?: number,
): { hp?: number; cc?: number } {
  const curated = lookupCuratedEngine(brand, model, badge, fuel, year);
  if (curated) return curated;

  const displacements = getDisplacementVariants(displacement);
  const models = getModelVariants(model);
  const fuels = getFuelLookupVariants(fuel);

  // 1. Try HP_DATA with exact displacement (when displacement is known)
  if (displacement > 0) {
    for (const m of models) {
      for (const d of displacements) {
        for (const f of fuels) {
          const key = `${brand}|${m}|${d}|${f}`;
          if (HP_DATA[key]) return { hp: HP_DATA[key] };
        }
      }
    }
  }

  // 2. Try ENGINE_FALLBACK: brand|model|fuel → { hp, cc }
  // This handles displacement=0 AND fills in missing displacement
  for (const m of models) {
    for (const f of fuels) {
      const fbKey = `${brand}|${m}|${f}`;
      if (ENGINE_FALLBACK[fbKey]) {
        const fb = ENGINE_FALLBACK[fbKey];
        return {
          hp: fb.hp,
          cc: displacement === 0 ? fb.cc : undefined, // only override cc if it was missing
        };
      }
    }
  }

  // 3. For known displacement but no match, try HP_DATA scan (unambiguous only)
  if (displacement === 0) {
    for (const m of models) {
      const matches = new Set<number>();
      for (const [key, hp] of Object.entries(HP_DATA)) {
        const [kb, km, , kf] = key.split('|');
        if (kb === brand && km === m && fuels.includes(kf)) matches.add(hp);
      }
      if (matches.size === 1) return { hp: matches.values().next().value };
    }
  }

  return {};
}

// Parse displacement from badge string like "가솔린 1.6 터보 2WD" → 1600

const bodyTypeMap: Record<string, string> = {
  'SUV': 'Кроссовер/Внедорожник',
  '세단': 'Седан',
  '해치백': 'Хэтчбек',
  '왜건': 'Универсал',
  '쿠페': 'Купе',
  '컨버터블': 'Кабриолет',
  'RV': 'Минивэн',
  '미니밴': 'Минивэн',
  '픽업': 'Пикап',
  '밴': 'Фургон',
  '스포츠카': 'Спорткар',
};

function translateBodyType(korean: string): string {
  if (!korean) return korean;
  return bodyTypeMap[korean] || korean;
}

// Korean option name → Russian translation
const optionTranslations: Record<string, string> = {
  '선루프': 'Люк (санруф)',
  '헤드램프(HID)': 'Фары HID (ксенон)',
  '헤드램프(LED)': 'Фары LED',
  '브레이크 잠김 방지(ABS)': 'ABS (антиблокировка)',
  '앞좌석 AV 모니터': 'Монитор передний',
  '내비게이션': 'Навигация',
  '전동시트': 'Электропривод сидений',
  '전동시트(운전석)': 'Электропривод сиденья водителя',
  '전동시트(동승석)': 'Электропривод сиденья пассажира',
  '전동시트(뒷좌석)': 'Электропривод задних сидений',
  '열선시트': 'Подогрев сидений',
  '열선시트(앞좌석)': 'Подогрев передних сидений',
  '열선시트(뒷좌석)': 'Подогрев задних сидений',
  '메모리 시트': 'Память сидений',
  '메모리 시트(운전석)': 'Память сиденья водителя',
  '메모리 시트(동승석)': 'Память сиденья пассажира',
  '통풍시트': 'Вентиляция сидений',
  '통풍시트(운전석)': 'Вентиляция сиденья водителя',
  '통풍시트(동승석)': 'Вентиляция сиденья пассажира',
  '통풍시트(뒷좌석)': 'Вентиляция задних сидений',
  '가죽시트': 'Кожаный салон',
  '무선도어 잠금장치': 'Бесключевой доступ',
  '알루미늄 휠': 'Литые диски',
  '미끄럼 방지(TCS)': 'Антипробуксовка (TCS)',
  '에어백(운전석)': 'Подушка безопасности водителя',
  '에어백(동승석)': 'Подушка безопасности пассажира',
  '에어백(사이드)': 'Боковые подушки безопасности',
  '에어백(커튼)': 'Шторки безопасности',
  '자동 에어컨': 'Климат-контроль',
  '전동접이 사이드 미러': 'Складные зеркала',
  'ECM 룸미러': 'Электрохромное зеркало',
  '스티어링 휠 리모컨': 'Кнопки на руле',
  '주차감지센서(후방)': 'Парктроник задний',
  '주차감지센서(전방)': 'Парктроник передний',
  '타이어 공기압센서(TPMS)': 'Датчик давления шин (TPMS)',
  '차체자세 제어장치(ESC)': 'Стабилизация (ESC)',
  '스마트키': 'Бесключевой запуск',
  '후방 카메라': 'Камера заднего вида',
  '크루즈 컨트롤(일반)': 'Круиз-контроль',
  '크루즈 컨트롤(어댑티브)': 'Адаптивный круиз-контроль',
  'USB 단자': 'USB-разъём',
  'AUX 단자': 'AUX-разъём',
  '하이패스': 'Hi-Pass (транспондер)',
  '레인센서': 'Датчик дождя',
  '열선 스티어링 휠': 'Подогрев руля',
  '전동 조절 스티어링 휠': 'Электрорегулировка руля',
  '패들 시프트': 'Подрулевые лепестки',
  '차선이탈 경보 시스템(LDWS)': 'Контроль полосы (LDWS)',
  '커튼/블라인드(뒷좌석)': 'Шторки задних стёкол',
  '커튼/블라인드(후방)': 'Шторка заднего стекла',
  '전자식 주차브레이크(EPB)': 'Электронный стояночный тормоз',
  '블루투스': 'Bluetooth',
  '오토 라이트': 'Автоматический свет',
  '전자제어 서스펜션(ECS)': 'Электронная подвеска (ECS)',
  'CD 플레이어': 'CD-проигрыватель',
  '뒷좌석 AV 모니터': 'Монитор для задних пассажиров',
  '파워 전동 트렁크': 'Электропривод багажника',
  '루프랙': 'Рейлинги на крыше',
  '후측방 경보 시스템': 'Контроль слепых зон',
  '360도 어라운드 뷰': 'Камера 360°',
  '고스트 도어 클로징': 'Доводчики дверей',
  '헤드업 디스플레이(HUD)': 'Проекция на лобовое (HUD)',
  '마사지 시트': 'Массаж сидений',
};

// Cache for option catalog (code → Korean name)
let optionCatalogCache: { data: Record<string, string>; timestamp: number } | null = null;
const OPTION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getOptionCatalog(): Promise<Record<string, string>> {
  if (optionCatalogCache && Date.now() - optionCatalogCache.timestamp < OPTION_CACHE_TTL) {
    return optionCatalogCache.data;
  }

  try {
    const res = await fetch(ENCAR_OPTIONS_API, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    });
    if (!res.ok) return {};

    const json = await res.json();
    const codeMap: Record<string, string> = {};

    for (const opt of json.options || []) {
      codeMap[opt.optionCd] = opt.optionName;
      if (opt.subOptions) {
        for (const sub of opt.subOptions) {
          codeMap[sub.optionCd] = sub.optionName;
        }
      }
    }

    optionCatalogCache = { data: codeMap, timestamp: Date.now() };
    return codeMap;
  } catch {
    return {};
  }
}

function translateOption(koreanName: string): string {
  return optionTranslations[koreanName] || koreanName;
}

async function resolveOptionCodes(codes: string[]): Promise<string[]> {
  if (!codes.length) return [];
  const catalog = await getOptionCatalog();
  return codes
    .map(code => catalog[code])
    .filter(Boolean)
    .map(translateOption);
}

// Build Encar API search query from our filters
// Format: (And.Hidden.N._.CarType.Y._.Condition1._.Condition2.)
// Each condition is separated by `_.`
function buildSearchQuery(filters: CarFilters): string {
  const parts: string[] = [];

  // Required base: Hidden.N (active listings only), SellType.일반 (exclude lease/rent)
  // CarType.Y = domestic, CarType.N = foreign — omit to show both
  parts.push('Hidden.N');
  parts.push(`SellType.${NORMAL_SELL_TYPE}`);

  if (filters.brand) {
    const koreanBrand = reverseTranslateBrand(filters.brand);
    // Use Korean name if available, otherwise use the original (for foreign brands like Lexus, BMW, etc.)
    parts.push(`Manufacturer.${koreanBrand || filters.brand}`);
  }

  if (filters.modelVariant) {
    // modelVariant is already the Korean model name (e.g., "더 뉴 아반떼 (CN7)")
    parts.push(`Model.${filters.modelVariant}`);
  } else if (filters.model) {
    // Use ModelGroup for base model search — matches ALL generations/variants
    const koreanModel = reverseTranslateModel(filters.model);
    // Use Korean name if available, otherwise use the original (for models like ES, RX, X5, etc.)
    parts.push(`ModelGroup.${koreanModel || filters.model}`);
  }

  // Badge values with '.' break Encar's query parser (e.g. "2.0 TDI")
  // Only include badge in query if it has no periods; otherwise filter post-fetch
  if (filters.badge && !filters.badge.includes('.')) {
    parts.push(`Badge.${filters.badge}`);
  }

  if (filters.badgeDetail) {
    parts.push(`BadgeDetail.${filters.badgeDetail}`);
  }

  if (filters.fuel) {
    const fuelMap: Record<string, string> = {
      gasoline: '가솔린',
      diesel: '디젤',
      hybrid: '가솔린+전기',
      electric: '전기',
      lpg: 'LPG',
    };
    if (fuelMap[filters.fuel]) {
      parts.push(`FuelType.${fuelMap[filters.fuel]}`);
    }
  }

  if (filters.yearFrom || filters.yearTo) {
    const fromYear = filters.yearFrom || 2000;
    const toYear = filters.yearTo || new Date().getFullYear();
    const fromMonth = String(filters.monthFrom || 1).padStart(2, '0');
    const toMonth = String(filters.monthTo || 12).padStart(2, '0');
    parts.push(`Year.range(${fromYear}${fromMonth}..${toYear}${toMonth})`);
  }

  if (filters.color) {
    const colorToKorean: Record<string, string> = {
      white: '흰색', black: '검정색', gray: '회색', silver: '은색',
      blue: '파란색', red: '빨간색', brown: '갈색', green: '녹색', other: '기타',
    };
    const korColor = colorToKorean[filters.color];
    if (korColor) parts.push(`Color.${korColor}`);
  }

  if (filters.priceFrom || filters.priceTo) {
    const from = filters.priceFrom || 0;
    const to = filters.priceTo || 999999;
    parts.push(`Price.range(${from}..${to})`);
  }

  if (filters.mileageFrom || filters.mileageTo) {
    const from = filters.mileageFrom || 0;
    const to = filters.mileageTo || 999999;
    parts.push(`Mileage.range(${from}..${to})`);
  }

  // Join with _.  separator and wrap in (And. ... .)
  return '(And.' + parts.join('._.') + '.)';
}

function mapSortField(sort?: string): string {
  switch (sort) {
    case 'price_asc': return 'PriceAsc';
    case 'price_desc': return 'PriceDesc';
    case 'year_desc': return 'Year';
    case 'year_asc': return 'Year'; // Encar doesn't support YearAsc, fallback to Year (newest)
    case 'mileage_asc': return 'MileageAsc';
    case 'mileage_desc': return 'MileageAsc'; // No MileageDesc, fallback
    default: return 'ModifiedDate';
  }
}

// Check which car IDs have ALL the required option codes
// Uses the lightweight readside API: ~250ms for 50 cars in parallel
async function filterByOptions(
  carIds: string[],
  requiredOptions: string[]
): Promise<Set<string>> {
  if (!requiredOptions.length || !carIds.length) return new Set(carIds);

  const results = await Promise.all(
    carIds.map(async (id) => {
      try {
        const res = await fetch(
          `${ENCAR_READSIDE_BASE}/vehicle/${id}?include=OPTIONS`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const opts = data.options;
        if (!opts) return null;
        const allCodes = [
          ...(opts.standard || []),
          ...(opts.choice || []),
          ...(opts.etc || []),
          ...(opts.tuning || []),
        ];
        const hasAll = requiredOptions.every((code) => allCodes.includes(code));
        return hasAll ? id : null;
      } catch {
        return null;
      }
    })
  );

  return new Set(results.filter(Boolean) as string[]);
}

// Cache for catalog responses
const catalogCache = new Map<string, { data: CatalogResponse; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const SNAPSHOT_CACHE_TTL = 60 * 1000; // Retry live Encar after one minute

// How many Encar results to fetch per batch when option filtering is active
const OPTION_FILTER_BATCH = 200;

// In-memory caches (persist across requests in same serverless instance)
const hpCache = new Map<string, number>();
const displacementCache = new Map<string, number>();

// Lightweight readside fetch to get displacement for a single car
async function fetchDisplacementFromReadside(carId: string): Promise<number> {
  try {
    const res = await fetch(
      `${ENCAR_READSIDE_BASE}/vehicle/${carId}?include=SPEC`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(2000) }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return data?.spec?.displacement || 0;
  } catch {
    return 0;
  }
}

// Cached live EUR rate for use in transformSearchResults
let liveEurRate: number | undefined;
let eurRateFetchedAt = 0;
let liveUsdRate: number | undefined;
let usdRateFetchedAt = 0;

async function getLiveEurRate(): Promise<number | undefined> {
  if (liveEurRate && Date.now() - eurRateFetchedAt < 60 * 60 * 1000) return liveEurRate;
  try {
    liveEurRate = await getEurToRub();
    eurRateFetchedAt = Date.now();
    return liveEurRate;
  } catch {
    return undefined;
  }
}

async function getLiveUsdRate(): Promise<number | undefined> {
  if (liveUsdRate && Date.now() - usdRateFetchedAt < 60 * 60 * 1000) return liveUsdRate;
  try {
    liveUsdRate = await getUsdToRub();
    usdRateFetchedAt = Date.now();
    return liveUsdRate;
  } catch {
    return undefined;
  }
}

async function transformSearchResults(
  searchResults: Record<string, unknown>[],
  options: { allowRemoteEnrichment?: boolean; directImages?: boolean } = {},
): Promise<CarListing[]> {
  const allowRemoteEnrichment = options.allowRemoteEnrichment !== false;
  const directImages = options.directImages === true;

  // Fetch live rates for customs calculations
  const [eurRate, usdRate] = await Promise.all([getLiveEurRate(), getLiveUsdRate()]);

  // Step 1: For cars with displacement=0, try local ENGINE_FALLBACK first (instant),
  // then readside API only for the remaining misses (limited to avoid timeout)
  const needsReadside: { index: number; id: string }[] = [];
  for (let i = 0; i < searchResults.length; i++) {
    const item = searchResults[i];
    const displacement = (item.Displacement as number) || 0;
    if (!displacement) {
      const id = String(item.Id || '');
      if (!id) continue;

      // Check displacement cache first
      const cached = displacementCache.get(id);
      if (cached) {
        (item as Record<string, unknown>).Displacement = cached;
        continue;
      }

      // Try ENGINE_FALLBACK locally (instant)
      const manufacturer = (item.Manufacturer as string) || '';
      const fuelType = (item.FuelType as string) || '';
      const modelName = (item.Model as string) || '';
      const badge = (item.Badge as string) || '';
      const badgeDisplacement = parseDisplacementFromBadge(badge);
      if (badgeDisplacement) {
        (item as Record<string, unknown>).Displacement = badgeDisplacement;
        displacementCache.set(id, badgeDisplacement);
        continue;
      }
      const models = getModelVariants(modelName);
      const fuels = getFuelLookupVariants(fuelType);
      let found = false;
      for (const m of models) {
        for (const f of fuels) {
          const fbKey = `${manufacturer}|${m}|${f}`;
          if (ENGINE_FALLBACK[fbKey]) {
            (item as Record<string, unknown>).Displacement = ENGINE_FALLBACK[fbKey].cc;
            displacementCache.set(id, ENGINE_FALLBACK[fbKey].cc);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found && allowRemoteEnrichment) {
        needsReadside.push({ index: i, id });
      }
    }
  }

  // Fetch from readside API only for cars not covered by ENGINE_FALLBACK (max 8 to avoid timeout)
  const readsideBatch = needsReadside.slice(0, 8);
  if (readsideBatch.length > 0) {
    const results = await Promise.all(
      readsideBatch.map(({ id }) => fetchDisplacementFromReadside(id))
    );
    for (let i = 0; i < readsideBatch.length; i++) {
      const cc = results[i];
      if (cc) {
        displacementCache.set(readsideBatch[i].id, cc);
        (searchResults[readsideBatch[i].index] as Record<string, unknown>).Displacement = cc;
      }
    }
  }

  // Step 2: Resolve HP from Encar and the local engine map. Pan Auto's
  // protected endpoint is intentionally used only for a selected detail page,
  // not multiplied across a catalog batch.
  const engineResults: { hp?: number; cc?: number }[] = searchResults.map((item) => {
    const id = String(item.Id || '');
    const displacement = (item.Displacement as number) || 0;
    const manufacturer = (item.Manufacturer as string) || '';
    const modelName = (item.Model as string) || '';
    const fuelType = (item.FuelType as string) || '';
    const badge = (item.Badge as string) || '';
    const itemYear = Number.parseInt(String(item.Year || '').substring(0, 4)) || undefined;

    // Always run the curated/local lookup before the HP-only caches. Curated
    // variants can supply both horsepower and a missing engine volume; returning
    // a cached HP first would silently discard that volume on later requests.
    const engine = lookupEngine(manufacturer, modelName, displacement, fuelType, badge, itemYear);
    if (engine.hp || engine.cc) {
      if (engine.hp) hpCache.set(id, engine.hp);
      return engine;
    }

    const searchHp = (item.MaxPower as number) || (item.HorsePower as number) || 0;
    if (searchHp) return { hp: searchHp };

    if (hpCache.has(id)) return { hp: hpCache.get(id) };

    return {};
  });

  const normalSaleResults = searchResults.map((item, index) => ({ item, index })).filter(({ item }) => {
    const sellType = item.SellType;
    return !sellType || sellType === NORMAL_SELL_TYPE;
  });

  return Promise.all(
    normalSaleResults.map(async ({ item, index: idx }) => {
      const carId = String(item.Id || '');
      const priceKrw = ((item.Price as number) || 0) * 10000;
      const [priceRub, priceUsd] = await Promise.all([
        convertKrwToRub(priceKrw),
        convertKrwToUsd(priceKrw),
      ]);

      const brand = translateBrand((item.Manufacturer as string) || '');
      const model = translateModel((item.Model as string) || '');
      const yearStr = String(item.Year || '');
      const year = parseInt(yearStr.substring(0, 4)) || 0;
      const month = parseInt(yearStr.substring(4, 6)) || undefined;

      const photo = item.Photo as string;
      const displayImageUrl = photo ? getEncarDisplayImageUrl(photo, 640, 480) : '';
      const imageUrl = photo
        ? directImages
          ? displayImageUrl
          : `/api/proxy-image?url=${encodeURIComponent(displayImageUrl)}`
        : '/images/no-image.svg';

      const engineData = engineResults[idx] || {};
      const hp = engineData.hp || 0;
      // Use Encar displacement first, then fallback to ENGINE_FALLBACK cc from local lookup
      const displacement = engineData.cc || (item.Displacement as number) || 0;
      const fuel = translateFuel((item.FuelType as string) || '');

      // Pre-calculate turnkey prices on server with accurate HP and live rates
      const russiaBreakdown = calculateImportCost({
        priceKrw, priceRub, displacement, year, month, fuel, hp: hp || undefined, destination: 'russia', eurRate, usdRate,
      });
      const tjBreakdown = calculateImportCost({
        priceKrw, priceRub, priceUsd, displacement, year, month, fuel, hp: hp || undefined, brand, model, destination: 'tajikistan', eurRate, usdRate,
      });

      // Build badge: "2.5 가솔린 2WD" + "프리미엄" → "2.5 Бензин 2WD Премиум"
      const rawBadge = (item.Badge as string) || '';
      const rawBadgeDetail = (item.BadgeDetail as string) || '';
      const explicitDrive = rawBadge.match(/(?:^|\s)(2\s*WD|4\s*WD|AWD)(?:\s|$)/i)?.[1]?.replace(/\s/g, '').toUpperCase();
      const drivetrainFromBadge = explicitDrive
        || (/콰트로|quattro|xDrive|4MATIC|ALL4/i.test(rawBadge) ? 'AWD' : '');
      const translatedBadge = rawBadge
        .replace(/가솔린\+전기/g, translateFuel('가솔린+전기'))
        .replace(/디젤\+전기/g, translateFuel('디젤+전기'))
        .replace(/가솔린/g, translateFuel('가솔린'))
        .replace(/디젤/g, translateFuel('디젤'))
        .replace(/하이브리드/g, translateFuel('하이브리드'))
        .replace(/전기/g, translateFuel('전기'));
      const badgeParts = [translatedBadge, translateBadgeDetail(rawBadgeDetail)].filter(Boolean);
      const badge = badgeParts.join(' ') || undefined;

      return {
        id: carId,
        source: 'encar' as const,
        brand,
        model,
        year,
        month,
        mileage: (item.Mileage as number) || 0,
        fuel,
        engine: displacement ? `${(displacement / 1000).toFixed(1)}L` : '',
        displacement,
        hp: hp || undefined,
        badge,
        color: translateColor((item.Color as string) || ''),
        bodyType: translateBodyType((item.BodyType as string) || ''),
        transmission: translateTransmission((item.Transmission as string) || ''),
        drivetrain: translateDrivetrain(drivetrainFromBadge),
        price_krw: priceKrw,
        price_rub: priceRub,
        price_usd: priceUsd,
        eur_to_rub: eurRate,
        usd_to_rub: usdRate,
        price_turnkey_russia: russiaBreakdown.total,
        price_turnkey_russia_usd: russiaBreakdown.total > 0
          ? Math.round(russiaBreakdown.total / (usdRate || (priceRub / priceUsd)))
          : 0,
        russia_calculation_complete: russiaBreakdown.calculationComplete,
        price_turnkey_tajikistan: tjBreakdown.total,
        imageUrl,
        images: [],
      } satisfies CarListing;
    })
  );
}

function hasHpFilter(filters: CarFilters): boolean {
  return filters.hpFrom !== undefined || filters.hpTo !== undefined;
}

function filterCarsByHp(cars: CarListing[], filters: CarFilters): CarListing[] {
  if (!hasHpFilter(filters)) return cars;

  const from = filters.hpFrom ?? 0;
  const to = filters.hpTo ?? Number.MAX_SAFE_INTEGER;

  return cars.filter((car) =>
    typeof car.hp === 'number' && car.hp >= from && car.hp <= to
  );
}

function estimatePostFilterTotal(total: number, candidateCount: number, matchedCount: number): number {
  if (!candidateCount) return 0;
  return Math.max(matchedCount, Math.round(total * (matchedCount / candidateCount)));
}

export async function searchCars(filters: CarFilters): Promise<CatalogResponse> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const hasOptionFilter = filters.options && filters.options.length > 0;
  // Badge with '.' can't be sent to Encar query — needs post-fetch filtering
  const hasBadgePostFilter = filters.badge && filters.badge.includes('.');
  const hasHpPostFilter = hasHpFilter(filters);
  const cacheKey = JSON.stringify(filters);

  // Check cache
  const cached = catalogCache.get(cacheKey);
  const cacheTtl = cached?.data.source === 'snapshot' ? SNAPSHOT_CACHE_TTL : CACHE_TTL;
  if (cached && Date.now() - cached.timestamp < cacheTtl) {
    return cached.data;
  }

  // Encar blocks requests from the production hosting network. Serve the full
  // downloaded inventory immediately when its local filters can satisfy the request.
  const savedSearch = getSnapshotSearch(filters);
  if (savedSearch) {
    const cars = await transformSearchResults(savedSearch.rows, {
      allowRemoteEnrichment: false,
      directImages: true,
    });
    const result: CatalogResponse = {
      cars,
      total: savedSearch.total,
      page: savedSearch.page,
      totalPages: savedSearch.totalPages,
      source: 'snapshot',
      snapshotGeneratedAt: savedSearch.generatedAt,
    };
    catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  try {
    const searchQuery = buildSearchQuery(filters);
    const sortField = mapSortField(filters.sort);

    if (hasOptionFilter) {
      // Option filtering mode: over-fetch, check options, filter
      const batchSize = OPTION_FILTER_BATCH;
      const offset = (page - 1) * batchSize;

      const sr = `|${sortField}|${offset}|${batchSize}`;
      const queryString = new URLSearchParams({
        count: 'true',
        q: searchQuery,
        sr,
      }).toString();

      const response = await fetch(`${ENCAR_API_BASE}?${queryString}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`Encar API error: ${response.status}`);

      const data = await response.json();
      const searchResults: Record<string, unknown>[] = data.SearchResults || [];
      const encarTotal = data.Count || 0;

      // Check options for all fetched cars
      const carIds = searchResults.map((item) => String(item.Id || ''));
      const matchingIds = await filterByOptions(carIds, filters.options!);

      // Filter search results to only matching cars
      let matchedResults = searchResults.filter((item) =>
        matchingIds.has(String(item.Id || ''))
      );

      // Also apply badge post-filter if needed
      if (hasBadgePostFilter) {
        matchedResults = matchedResults.filter(
          (item) => (item.Badge as string) === filters.badge
        );
      }

      // Estimate total matching cars based on hit rate
      const hitRate = carIds.length > 0 ? matchingIds.size / carIds.length : 0;
      const estimatedTotal = Math.round(encarTotal * hitRate);

      const carsBeforeHp = await transformSearchResults(matchedResults);
      const hpMatchedCars = filterCarsByHp(carsBeforeHp, filters);
      const hpAdjustedTotal = hasHpPostFilter
        ? estimatePostFilterTotal(estimatedTotal, carsBeforeHp.length, hpMatchedCars.length)
        : estimatedTotal;
      const cars = hpMatchedCars.slice(0, limit);

      const result: CatalogResponse = {
        cars,
        total: hpAdjustedTotal,
        page,
        totalPages: Math.ceil(hpAdjustedTotal / limit),
      };

      catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    // Badge post-filter mode: over-fetch and filter by Badge field
    if (hasBadgePostFilter) {
      const batchSize = OPTION_FILTER_BATCH;
      const offset = (page - 1) * batchSize;
      const sr = `|${sortField}|${offset}|${batchSize}`;

      const queryString = new URLSearchParams({
        count: 'true',
        q: searchQuery,
        sr,
      }).toString();

      const response = await fetch(`${ENCAR_API_BASE}?${queryString}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`Encar API error: ${response.status}`);

      const data = await response.json();
      const searchResults: Record<string, unknown>[] = data.SearchResults || [];
      const encarTotal = data.Count || 0;

      // Filter by badge post-fetch
      const matchedResults = searchResults.filter(
        (item) => (item.Badge as string) === filters.badge
      );

      const hitRate = searchResults.length > 0 ? matchedResults.length / searchResults.length : 0;
      const estimatedTotal = Math.round(encarTotal * hitRate);

      const carsBeforeHp = await transformSearchResults(matchedResults);
      const hpMatchedCars = filterCarsByHp(carsBeforeHp, filters);
      const hpAdjustedTotal = hasHpPostFilter
        ? estimatePostFilterTotal(estimatedTotal, carsBeforeHp.length, hpMatchedCars.length)
        : estimatedTotal;
      const cars = hpMatchedCars.slice(0, limit);

      const result: CatalogResponse = {
        cars,
        total: hpAdjustedTotal,
        page,
        totalPages: Math.ceil(hpAdjustedTotal / limit),
      };

      catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    // Normal mode (no option filtering, no badge post-filter)
    const batchSize = hasHpPostFilter ? OPTION_FILTER_BATCH : limit;
    const offset = (page - 1) * batchSize;
    const sr = `|${sortField}|${offset}|${batchSize}`;

    const queryString = new URLSearchParams({
      count: 'true',
      q: searchQuery,
      sr,
    }).toString();

    const response = await fetch(`${ENCAR_API_BASE}?${queryString}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`Encar API error: ${response.status}`);
    }

    const data = await response.json();
    const searchResults = data.SearchResults || [];
    const total = data.Count || 0;

    const carsBeforeHp = await transformSearchResults(searchResults);
    const hpMatchedCars = filterCarsByHp(carsBeforeHp, filters);
    const totalAfterHp = hasHpPostFilter
      ? estimatePostFilterTotal(total, carsBeforeHp.length, hpMatchedCars.length)
      : total;
    const cars = hasHpPostFilter ? hpMatchedCars.slice(0, limit) : carsBeforeHp;

    const result: CatalogResponse = {
      cars,
      total: totalAfterHp,
      page,
      totalPages: Math.ceil(totalAfterHp / limit),
    };

    catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Encar API search error:', error);

    const snapshotResult = getSnapshotSearch(filters);
    if (snapshotResult) {
      const cars = await transformSearchResults(snapshotResult.rows, {
        allowRemoteEnrichment: false,
        directImages: true,
      });
      const result: CatalogResponse = {
        cars,
        total: snapshotResult.total,
        page: snapshotResult.page,
        totalPages: snapshotResult.totalPages,
        source: 'snapshot',
        snapshotGeneratedAt: snapshotResult.generatedAt,
      };
      catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    return {
      cars: [],
      total: 0,
      page,
      totalPages: 0,
      error: 'upstream_unavailable',
    };
  }
}

// Panel name → Russian translation
const panelNameRu: Record<string, string> = {
  hood: 'Капот',
  frontFenderLeft: 'Переднее крыло (лев.)',
  frontFenderRight: 'Переднее крыло (прав.)',
  frontDoorLeft: 'Передняя дверь (лев.)',
  frontDoorRight: 'Передняя дверь (прав.)',
  rearDoorLeft: 'Задняя дверь (лев.)',
  rearDoorRight: 'Задняя дверь (прав.)',
  trunkLead: 'Крышка багажника',
  frontPanel: 'Передняя панель',
  insidePanelLeft: 'Внутренняя панель (лев.)',
  insidePanelRight: 'Внутренняя панель (прав.)',
  frontWheelHouseLeft: 'Передняя колёсная арка (лев.)',
  frontWheelHouseRight: 'Передняя колёсная арка (прав.)',
  crossMember: 'Поперечина',
  dashPanel: 'Панель приборов',
  roofPanel: 'Крыша',
  floorPanel: 'Днище',
  rearDashPanel: 'Задняя панель приборов',
  rearWheelHouseLeft: 'Задняя колёсная арка (лев.)',
  rearWheelHouseRight: 'Задняя колёсная арка (прав.)',
  trunkFloor: 'Пол багажника',
  rearPanel: 'Задняя панель',
  quarterPanelLeft: 'Заднее крыло (лев.)',
  quarterPanelRight: 'Заднее крыло (прав.)',
  sideSillPanelLeft: 'Порог (лев.)',
  sideSillPanelRight: 'Порог (прав.)',
  pillarPanelFrontLeft: 'Стойка A (лев.)',
  pillarPanelFrontRight: 'Стойка A (прав.)',
  pillarPanelMiddleLeft: 'Стойка B (лев.)',
  pillarPanelMiddleRight: 'Стойка B (прав.)',
  pillarPanelRearLeft: 'Стойка C (лев.)',
  pillarPanelRearRight: 'Стойка C (прав.)',
  rearSideMemberLeft: 'Задний лонжерон (лев.)',
  rearSideMemberRight: 'Задний лонжерон (прав.)',
  frontSideMemberLeft: 'Передний лонжерон (лев.)',
  frontSideMemberRight: 'Передний лонжерон (прав.)',
  radiatorSupport: 'Суппорт радиатора',
  packageTray: 'Полка багажника',
};

// Panel rank from the performanceCheck dataGroup
const panelRankMap: Record<string, string> = {
  hood: '1', frontFenderLeft: '1', frontFenderRight: '1',
  frontDoorLeft: '1', frontDoorRight: '1', rearDoorLeft: '1', rearDoorRight: '1',
  trunkLead: '1', radiatorSupport: '1',
  roofPanel: '2', quarterPanelLeft: '2', quarterPanelRight: '2',
  sideSillPanelLeft: '2', sideSillPanelRight: '2',
  frontPanel: 'A', insidePanelLeft: 'A', insidePanelRight: 'A',
  crossMember: 'A', trunkFloor: 'A', rearPanel: 'A',
  frontWheelHouseLeft: 'B', frontWheelHouseRight: 'B',
  rearWheelHouseLeft: 'B', rearWheelHouseRight: 'B',
  pillarPanelFrontLeft: 'B', pillarPanelFrontRight: 'B',
  pillarPanelMiddleLeft: 'B', pillarPanelMiddleRight: 'B',
  pillarPanelRearLeft: 'B', pillarPanelRearRight: 'B',
  rearSideMemberLeft: 'B', rearSideMemberRight: 'B',
  frontSideMemberLeft: 'B', frontSideMemberRight: 'B',
  dashPanel: 'C', floorPanel: 'C', packageTray: 'C',
};

async function fetchInspectionData(carId: string): Promise<InspectionData | null> {
  try {
    // Resolve vehicleId (listing ID and vehicleId can differ)
    const readRes = await fetch(
      `${ENCAR_READSIDE_BASE}/vehicle/${carId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
    );
    if (!readRes.ok) return null;
    const readData = await readRes.json();
    const vehicleId = readData.vehicleId || carId;

    // Fetch inspection data from the legacy JSON API
    const res = await fetch(
      `${ENCAR_INSPECTION_BASE}/${vehicleId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const outer: Record<string, string[] | null> = data.outer || {};
    const accidentSummary = data.inspectAccidentSummary || {};

    const panels: PanelDamage[] = [];
    const summary = { change: 0, metal: 0, corrosion: 0, scratch: 0, dent: 0, damage: 0 };

    for (const [panelName, damages] of Object.entries(outer)) {
      if (!damages || !Array.isArray(damages) || damages.length === 0) continue;
      if (panelName === 'crossMemberType1') continue;

      const validDamages = damages.filter((d): d is DamageType =>
        ['CHANGE', 'METAL', 'CORROSION', 'SCRATCH', 'HILLS', 'DAMAGE'].includes(d)
      );

      if (validDamages.length === 0) continue;

      panels.push({
        name: panelName,
        nameRu: panelNameRu[panelName] || panelName,
        rank: panelRankMap[panelName] || '',
        damages: validDamages,
      });

      for (const d of validDamages) {
        if (d === 'CHANGE') summary.change++;
        else if (d === 'METAL') summary.metal++;
        else if (d === 'CORROSION') summary.corrosion++;
        else if (d === 'SCRATCH') summary.scratch++;
        else if (d === 'HILLS') summary.dent++;
        else if (d === 'DAMAGE') summary.damage++;
      }
    }

    const accidentHistory = accidentSummary.accident === 'EXISTS' ? true
      : accidentSummary.accident === 'NONE' ? false : undefined;
    const simpleRepair = accidentSummary.simpleRepair === 'EXISTS' ? true
      : accidentSummary.simpleRepair === 'NONE' ? false : undefined;

    return {
      panels,
      summary,
      hasDamage: panels.length > 0,
      accidentHistory,
      simpleRepair,
    };
  } catch (error) {
    console.error('Encar inspection fetch error:', error);
    return null;
  }
}

export async function enrichDetailWithPanAuto(car: CarListing): Promise<CarListing> {
  const reference = await getPanAutoVehicleReference(car.id);
  if (!reference) return car;

  const hp = reference.hp || car.hp;
  const now = new Date();
  const ageMonths = (now.getFullYear() - car.year) * 12 + (now.getMonth() + 1 - (car.month || 1));
  const standardCustoms = reference.customsRub;
  const usableStandardCustoms = standardCustoms
    && standardCustoms.customsDuty > 0
    && standardCustoms.customsFee > 0
    && standardCustoms.utilizationFee > 0
    ? standardCustoms
    : undefined;
  const olderVehicleCustoms = ageMonths >= 60
    && reference.highCustomsRub
    && reference.highCustomsRub.customsDuty > 0
    && reference.highCustomsRub.customsFee > 0
    && reference.highCustomsRub.utilizationFee > 0
    ? reference.highCustomsRub
    : undefined;
  const selectedCustoms = usableStandardCustoms || olderVehicleCustoms;
  const panAutoCustoms = selectedCustoms
    ? { ...selectedCustoms, checkedAt: reference.checkedAt }
    : undefined;
  const eurRate = car.eur_to_rub || await getLiveEurRate() || 100;
  const usdRate = car.usd_to_rub || await getLiveUsdRate() || 87.5;
  const russiaBreakdown = calculateImportCost({
    priceKrw: car.price_krw,
    priceRub: car.price_rub,
    priceUsd: car.price_usd,
    displacement: car.displacement || 0,
    year: car.year,
    month: car.month,
    fuel: car.fuel,
    hp,
    brand: car.brand,
    model: car.model,
    destination: 'russia',
    eurRate,
    usdRate,
    russiaCustomsOverride: panAutoCustoms,
  });

  return {
    ...car,
    hp,
    horsepowerSource: reference.hp ? 'pan-auto' : car.horsepowerSource,
    panAutoCustoms,
    eur_to_rub: eurRate,
    usd_to_rub: usdRate,
    price_turnkey_russia: russiaBreakdown.total,
    price_turnkey_russia_usd: russiaBreakdown.total > 0
      ? Math.round(russiaBreakdown.total / usdRate)
      : 0,
    russia_calculation_complete: russiaBreakdown.calculationComplete,
  };
}

export async function getCarDetail(carId: string): Promise<CarListing | null> {
  const getSavedCar = async () => {
    const snapshotCar = getSnapshotCarById(carId);
    if (!snapshotCar) return null;
    const [car] = await transformSearchResults([snapshotCar], {
      allowRemoteEnrichment: false,
      directImages: true,
    });
    return car || null;
  };

  const savedCar = await getSavedCar();
  if (savedCar) return savedCar;

  try {
    // Fetch readside and search API in parallel for faster loading
    const searchQuery = `(And.Hidden.N._.SellType.${NORMAL_SELL_TYPE}._.CarId.${carId}.)`;
    const [readRes, searchRes] = await Promise.all([
      fetch(
        `${ENCAR_READSIDE_BASE}/vehicle/${carId}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        }
      ),
      fetch(
        `${ENCAR_API_BASE}?${new URLSearchParams({ count: 'true', q: searchQuery, sr: '|ModifiedDate|0|1' })}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        }
      ).catch(() => null),
    ]);

    if (!readRes.ok) {
      console.error(`Readside API error: ${readRes.status} for car ${carId}`);
      return savedCar;
    }

    const readData = await readRes.json();

    let searchItem: Record<string, unknown> | null = null;
    if (searchRes?.ok) {
      const searchData = await searchRes.json();
      const results = searchData.SearchResults || [];
      if (results.length > 0) {
        searchItem = results[0];
      }
    }

    // Readside API nests data under category, spec, advertisement
    const cat = readData.category || {};
    const spec = readData.spec || {};
    const adv = readData.advertisement || {};

    // Use readside data as primary, search data as fallback for some fields
    const manufacturer = cat.manufacturerName || (searchItem?.Manufacturer as string) || '';
    const modelGroupName = cat.modelGroupName || (searchItem?.Model as string) || '';
    const modelFullName = cat.modelName || ''; // specific generation e.g. "더 뉴 투싼 (NX4)"
    const yearMonth = String(cat.yearMonth || searchItem?.Year || '');
    const mileage = spec.mileage || (searchItem?.Mileage as number) || 0;
    const fuelName = spec.fuelName || (searchItem?.FuelType as string) || '';
    const displacement = spec.displacement || (searchItem?.Displacement as number) || 0;
    const colorName = spec.colorName || (searchItem?.Color as string) || '';
    const bodyName = spec.bodyName || (searchItem?.BodyType as string) || '';
    const transmissionName = spec.transmissionName || (searchItem?.Transmission as string) || '';
    const drivetrainName = spec.drivetrainName
      || spec.driveTypeName
      || spec.driveName
      || (searchItem?.DriveType as string)
      || '';
    const gradeName = cat.gradeEnglishName || cat.gradeName || '';
    const price = adv.price || (searchItem?.Price as number) || 0;

    const priceKrw = price * 10000;
    const [priceRub, priceUsd] = await Promise.all([
      convertKrwToRub(priceKrw),
      convertKrwToUsd(priceKrw),
    ]);

    // Get photos from readside API
    const photos: { type: string; path: string }[] = readData.photos || [];
    const typeOrder: Record<string, number> = { OUTER: 0, INNER: 1, OPTION: 2 };
    const imageUrls = photos
      .filter((p: { type: string }) => ['OUTER', 'INNER', 'OPTION'].includes(p.type))
      .sort((a: { type: string; path: string }, b: { type: string; path: string }) => {
        const ta = typeOrder[a.type] ?? 9;
        const tb = typeOrder[b.type] ?? 9;
        if (ta !== tb) return ta - tb;
        const na = parseInt(a.path.match(/_(\d+)\.\w+$/)?.[1] || '0');
        const nb = parseInt(b.path.match(/_(\d+)\.\w+$/)?.[1] || '0');
        return na - nb;
      })
      .map((p: { path: string }) => `/api/proxy-image?url=${encodeURIComponent(getEncarDisplayImageUrl(p.path, 1280, 768))}`);

    // If no photos from readside, try search result photo prefix
    if (imageUrls.length === 0 && searchItem?.Photo) {
      const photo = searchItem.Photo as string;
      imageUrls.push(`/api/proxy-image?url=${encodeURIComponent(getEncarDisplayImageUrl(photo, 1280, 768))}`);
    }

    // Resolve option codes to translated names
    const rawOptions = readData.options;
    const optionCodes: string[] = [];
    if (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
      for (const key of ['standard', 'choice', 'etc', 'tuning']) {
        if (Array.isArray(rawOptions[key])) {
          optionCodes.push(...rawOptions[key].filter((c: unknown) => typeof c === 'string'));
        }
      }
    }

    const [equipment, inspectionData, vinData] = await Promise.all([
      resolveOptionCodes(optionCodes),
      fetchInspectionData(carId),
      fetchDataFromVin(readData.vin),
    ]);

    const brand = translateBrand(manufacturer);
    const model = translateModel(modelGroupName);
    // Generation: use modelName if it differs from modelGroupName (e.g. "더 뉴 투싼 (NX4)")
    const generation = modelFullName && modelFullName !== modelGroupName
      ? translateModel(modelFullName)
      : undefined;
    const trim = gradeName ? (cat.gradeEnglishName || translateModel(gradeName)) : undefined;

    // Build badge from search item (e.g. "2.5 가솔린 2WD" + "프리미엄")
    const rawDetailBadge = (searchItem?.Badge as string) || '';
    const rawDetailBadgeDetail = (searchItem?.BadgeDetail as string) || '';
    const translatedDetailBadge = rawDetailBadge
      .replace(/가솔린\+전기/g, translateFuel('가솔린+전기'))
      .replace(/디젤\+전기/g, translateFuel('디젤+전기'))
      .replace(/가솔린/g, translateFuel('가솔린'))
      .replace(/디젤/g, translateFuel('디젤'))
      .replace(/하이브리드/g, translateFuel('하이브리드'))
      .replace(/전기/g, translateFuel('전기'));
    const detailBadgeParts = [translatedDetailBadge, translateBadgeDetail(rawDetailBadgeDetail)].filter(Boolean);
    const detailBadge = detailBadgeParts.join(' ') || undefined;

    const detailYear = parseInt(yearMonth.substring(0, 4)) || undefined;
    const engineLookup = lookupEngine(manufacturer, modelGroupName, displacement, fuelName, rawDetailBadge, detailYear);
    const finalDisplacement = engineLookup.cc || displacement || vinData.displacement || 0;
    const finalHp = engineLookup.hp || vinData.hp || (searchItem?.MaxPower as number) || (searchItem?.HorsePower as number) || undefined;
    const finalFuel = translateFuel(fuelName);
    const carYear = parseInt(yearMonth.substring(0, 4)) || 0;
    const carMonth = parseInt(yearMonth.substring(4, 6)) || undefined;

    // Pre-calculate turnkey prices on server with accurate data and live rates
    const [detailEurRate, detailUsdRate] = await Promise.all([getLiveEurRate(), getLiveUsdRate()]);
    const russiaBreakdown = calculateImportCost({
      priceKrw, priceRub, displacement: finalDisplacement,
      year: carYear, month: carMonth, fuel: finalFuel, hp: finalHp, destination: 'russia', eurRate: detailEurRate, usdRate: detailUsdRate,
    });
    const tjBreakdown = calculateImportCost({
      priceKrw, priceRub, priceUsd, displacement: finalDisplacement,
      year: carYear, month: carMonth, fuel: finalFuel, hp: finalHp, brand, model, destination: 'tajikistan', eurRate: detailEurRate, usdRate: detailUsdRate,
    });

    const car: CarListing = {
      id: carId,
      source: 'encar',
      brand,
      model,
      generation: generation || undefined,
      trim: trim || undefined,
      badge: detailBadge,
      year: carYear,
      month: carMonth,
      mileage,
      fuel: finalFuel,
      engine: finalDisplacement ? `${(finalDisplacement / 1000).toFixed(1)}L` : '',
      displacement: finalDisplacement,
      hp: finalHp,
      color: translateColor(colorName),
      bodyType: translateBodyType(bodyName),
      transmission: translateTransmission(transmissionName),
      drivetrain: translateDrivetrain(drivetrainName),
      seatCount: spec.seatCount || undefined,
      price_krw: priceKrw,
      price_rub: priceRub,
      price_usd: priceUsd,
      eur_to_rub: detailEurRate,
      usd_to_rub: detailUsdRate,
      price_turnkey_russia: russiaBreakdown.total,
      price_turnkey_russia_usd: russiaBreakdown.total > 0
        ? Math.round(russiaBreakdown.total / (detailUsdRate || (priceRub / priceUsd)))
        : 0,
      russia_calculation_complete: russiaBreakdown.calculationComplete,
      price_turnkey_tajikistan: tjBreakdown.total,
      imageUrl: imageUrls[0] || '/images/no-image.svg',
      images: imageUrls,
      equipment,
      vin: readData.vin || '',
      accidentHistory: [],
      inspectionData: inspectionData || undefined,
    };
    return car;
  } catch (error) {
    console.error('Encar detail fetch error:', error);
    return savedCar;
  }
}

export function getProxiedImageUrl(originalUrl: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
}
